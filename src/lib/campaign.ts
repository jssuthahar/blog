import { currentCampaign } from '@msdevbuild/config/engage';

/**
 * Credit a sign-up, registration or message to the campaign link the reader
 * came through (admin.msdevbuild.com → Campaigns). `send` gets the campaign
 * short name, or '' for none, and adds it as a `campaign` field when set.
 *
 * firestore.rules only accepts a campaign that still exists, so a stale one
 * (deleted since the reader clicked) is refused with 403. Then this sends once
 * more without it: attribution is nice to have, a lost sign-up is not.
 */
export async function withCampaign(send: (campaign: string) => Promise<Response>): Promise<Response> {
  const campaign = currentCampaign();
  const res = await send(campaign);
  if (!campaign || res.status !== 403) return res;
  return send('');
}

/** Firestore REST fields + mask for the campaign, or nothing. */
export const campaignField = (campaign: string) =>
  campaign ? { fields: { campaign: { stringValue: campaign } }, paths: ['campaign'] } : { fields: {}, paths: [] as string[] };
