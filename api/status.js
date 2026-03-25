// Vercel Serverless Function — Current Availability / Hire-Me Status
//
// GET /api/status
// Response shape:
// {
//   available: true,
//   seeking: "Industrial Attachment",
//   until: "May 2026"
// }
//
// Values can be overridden via environment variables on Vercel:
// - STATUS_AVAILABLE (true/false)
// - STATUS_SEEKING
// - STATUS_UNTIL

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const availableEnv = process.env.STATUS_AVAILABLE;
  const available =
    typeof availableEnv === 'string'
      ? availableEnv.toLowerCase() === 'true'
      : true;

  const payload = {
    available,
    seeking: process.env.STATUS_SEEKING || 'Industrial Attachment',
    until: process.env.STATUS_UNTIL || 'May 2026',
  };

  res.status(200).json(payload);
};

