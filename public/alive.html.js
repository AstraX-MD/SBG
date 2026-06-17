const aliveHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SBG Bot Status</title>
    <style>
        body {
            background-color: #141311;
            color: #E1B64E;
            font-family: 'Space Grotesk', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }
        .container {
            border: 2px solid #E1B64E;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(225, 182, 78, 0.2);
        }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        p { font-size: 1.2rem; color: #CD5233; }
        .bot-img { width: 150px; height: 150px; border-radius: 50%; border: 4px solid #E1B64E; margin-bottom: 1rem; }
        .status-badge { background: #CD5233; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://i.ibb.co/0pymBf8T/file-000000002ee471f4a0c0930a2621f19a.png" class="bot-img" alt="SBG Bot">
        <h1>SBG Bot is Alive</h1>
        <p>Small But Genius WhatsApp Assistant</p>
        <div class="status-badge">ONLINE</div>
    </div>
</body>
</html>
`
export default aliveHtml
