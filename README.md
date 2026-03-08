This is a QR generator project, more to come

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) installed (v14 or higher).

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npm start
```

Then open your browser and go to:

```
http://localhost:3000
```

---

## How to Use

### URL Input

Enter any web address (e.g. `https://example.com`) into the **Destination URL** field. When you click **Create Unique QR**, a QR code will be generated that takes anyone who scans it directly to that URL.

### File Upload

Use the **Upload File** section to attach a PDF, image, or other document (up to 50 MB). You can drag and drop a file onto the upload area or click **Browse files** to select one from your computer. When you click **Create Unique QR**, the file is hosted by the app and the generated QR code will link directly to it — so anyone who scans the code can open or download the file.

> Note: The URL input and file upload are mutually exclusive. Selecting a file clears the URL field, and typing a URL clears any selected file.

### Downloading your QR code

Once a QR code is generated, click the **Download QR** button to save it as a PNG image.

### Creating another QR code

Click **Create Another** to go back and generate a new QR code.

---

## Stopping the App

To stop the server, go to the terminal where `npm start` is running and press:

```
Ctrl + C
```
