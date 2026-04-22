<<<<<<< HEAD
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "crons": [
    {
      "path": "/api/ping",
      "schedule": "*/3 * * * *"
    }
  ]
}
=======
export default async function handler(req, res) {
  try {
    const response = await fetch("https://divinesky-613l.onrender.com/health");
    console.log("Ping status:", response.status);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false });
  }
} 
>>>>>>> e903d6993f42d604e2ea91ae7657cdffd29e7efb
