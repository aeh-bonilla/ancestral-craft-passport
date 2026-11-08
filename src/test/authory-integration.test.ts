import { webcrypto } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  computeDossierSha256,
  computeFileSha256,
  computeTextSha256,
} from "@/lib/stellar/client-crypto";
import {
  STELLAR_CONFIG,
  getContractExplorerUrl,
  getTxExplorerUrl,
} from "@/lib/stellar/config";
import {
  buildInitialWorkEvents,
  generatePassportCertificateHtml,
  pieceToWork,
  workToPiece,
} from "@/lib/authory-service";
import {
  buildCodiConceptAndRef,
  createPeyCodiQrOnServer,
  createPeyPaymentLinkOnServer,
  getPeyPaymentStatusOnServer,
} from "@/lib/pey/pey.server";
import {
  processPeyWebhookEvent,
  signPeyWebhookPayload,
  verifyPeyWebhookSignature,
} from "@/lib/pey/webhook.server";
import { pieces } from "@/lib/toltek";

beforeAll(() => vi.stubGlobal("crypto", webcrypto));

describe("Authory × Tlamatik integration", () => {
  it("uses the deployed Authory Soroban contract on Stellar Testnet", () => {
    expect(STELLAR_CONFIG.contractId).toBe(
      "CAOAFGPATXWJ6KKGXFYHY42Q4N75NOWSR3NH3K2DT7QR3YSMDGT5P2HO",
    );
    expect(getContractExplorerUrl()).toContain(STELLAR_CONFIG.contractId);
    expect(getTxExplorerUrl(STELLAR_CONFIG.sampleRegisterTxHash)).toContain(
      STELLAR_CONFIG.sampleRegisterTxHash,
    );
  });

  it("computes deterministic SHA-256 hashes for text, binary files, and cultural dossiers", async () => {
    const textHash = await computeTextSha256("Alebrije Jaguar Nahual");
    expect(textHash).toMatch(/^[a-f0-9]{64}$/);

    const blob = new Blob(["evidencia-binaria-copal-oaxaca"], {
      type: "text/plain",
    }) as unknown as File;
    const fileHash = await computeFileSha256(blob);
    expect(fileHash).toMatch(/^[a-f0-9]{64}$/);
    expect(fileHash).not.toBe(textHash);

    const dossierHash = await computeDossierSha256(
      {
        title: "Alebrije Jaguar Nahual",
        artisan: "Don Miguel Aguilar",
        category: "Talla en Madera",
        technique: "Copal",
        materials: "Grana cochinilla",
        priceMxn: "8900",
      },
      [{ name: "copal.txt", size: 30, type: "text/plain", sha256: fileHash }],
    );
    expect(dossierHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("maps pieces and Authory works bidirectionally and generates initial rights events", () => {
    const seed = pieces[0]!;
    const work = pieceToWork(seed);
    expect(work.id).toBe(seed.id);
    expect(work.author).toBe(seed.artisan);

    const roundTrip = workToPiece(work);
    expect(roundTrip.id).toBe(seed.id);
    expect(roundTrip.artisan).toBe(seed.artisan);

    const events = buildInitialWorkEvents(work);
    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe("registration");
    expect(events[1]?.type).toBe("evidence");

    const html = generatePassportCertificateHtml(work, events);
    expect(html).toContain(work.id);
    expect(html).toContain(STELLAR_CONFIG.contractId);
    expect(html).toContain(work.hash);
  });

  it("creates pey.mx CoDi QR and Payment Link payloads for Tecuani TK-0512 ($595 MXN)", async () => {
    const tecuani = pieces.find((p) => p.id === "TK-0512")!;
    const totalMxn =
      tecuani.priceMxn + (tecuani.certFeeMxn ?? 0) + (tecuani.shippingMxn ?? 0);
    expect(totalMxn).toBe(595);

    const { concept, numRef } = buildCodiConceptAndRef(
      tecuani.id,
      tecuani.title,
    );
    expect(numRef).toBe("0512");
    expect(concept.length).toBeLessThanOrEqual(40);
    expect(concept).toContain("TK-0512");

    const codiQr = await createPeyCodiQrOnServer({
      pieceId: tecuani.id,
      title: tecuani.title,
      amountMxn: totalMxn,
    });
    expect(codiQr.amount).toBe(595);
    expect(codiQr.id).toBe("35a13c0512");
    expect(codiQr.endpoint).toBe("https://api.pey.mx/codi/qr");

    const payLink = await createPeyPaymentLinkOnServer({
      pieceId: tecuani.id,
      title: tecuani.title,
      artisan: tecuani.artisan,
      community: tecuani.community,
      amountMxn: totalMxn,
    });
    expect(payLink.amount).toBe(595);
    expect(payLink.url).toContain("https://app.mipey.mx/payment-link/");
    expect(payLink.endpoint).toBe("https://api.pey.mx/payment-link/create");

    const status = await getPeyPaymentStatusOnServer({
      paymentLinkId: payLink.id,
      codiQrId: codiQr.id,
      amountMxn: totalMxn,
      numRef: codiQr.numRef,
    });
    expect(status.status).toBe("PAID");
    expect(status.trackingKey).toMatch(/0512$/);
  });

  it("verifies Standard Webhooks signatures and processes pey.mx payment events with idempotency", async () => {
    const secret = "whsec_dGxhbWF0aWtfcGV5X3dlYmhvb2tfc2VjcmV0XzIwMjY=";
    const nowSec = Math.floor(Date.now() / 1000);
    const webhookId = "msg_tecuani_0512";
    const webhookTimestamp = String(nowSec);
    const rawBody = JSON.stringify({
      type: "codi.qr.payment_received",
      amount: 595,
      codiQrId: "35a13c0512",
      concept: "Tlamatik TK-0512 El Guardian del Monte",
      datePaid: nowSec,
      numRef: "0512",
      transactionId: "01M3QR8H0RH0XBCKYYD2000512",
      metadata: {
        trackingKey: "2026110840014000000000512",
        externalMetadata: { pieceId: "TK-0512" },
      },
    });

    const validSignature = signPeyWebhookPayload(
      rawBody,
      webhookId,
      webhookTimestamp,
      secret,
    );

    const checkValid = verifyPeyWebhookSignature({
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature: validSignature,
      secret,
      nowEpochSeconds: nowSec,
    });
    expect(checkValid.valid).toBe(true);

    const checkTampered = verifyPeyWebhookSignature({
      rawBody: rawBody.replace("595", "10"),
      webhookId,
      webhookTimestamp,
      webhookSignature: validSignature,
      secret,
      nowEpochSeconds: nowSec,
    });
    expect(checkTampered.valid).toBe(false);

    const processed = await processPeyWebhookEvent({
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature: validSignature,
      secretOverride: secret,
    });
    expect(processed.pieceId).toBe("TK-0512");
    expect(processed.amountMxn).toBe(595);
    expect(processed.basePriceMxn).toBe(450);
    expect(processed.certFeeMxn).toBe(25);
    expect(processed.shippingMxn).toBe(120);
    expect(processed.netArtisanMxn).toBe(428.4);
    expect(processed.signatureVerified).toBe(true);
    expect(processed.duplicate).toBe(false);
    expect(processed.sorobanContractId).toBe(STELLAR_CONFIG.contractId);
    expect(processed.sorobanFunction).toBe("record_rights_event");
    expect(processed.sorobanEventType).toBe("assignment");
    expect(processed.sorobanEventId).toBe("EVT-WH-YYD2000512");
    expect(processed.sorobanTxHash).toHaveLength(64);
    expect(processed.pieceSha256Hash).toHaveLength(64);

    const duplicate = await processPeyWebhookEvent({
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature: validSignature,
      secretOverride: secret,
    });
    expect(duplicate.duplicate).toBe(true);
  });
});

