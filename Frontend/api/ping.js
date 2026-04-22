export default async function handler(req, res) {
  try {
    const response = await fetch("https://divinesky-613l.onrender.com/health");

    console.log("Ping status:", response.status);

    return res.status(200).json({
      ok: true,
      status: response.status
    });

  } catch (err) {
    console.error("Error:", err);

    return res.status(500).json({
      ok: false
    });
  }
}