import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const helloWorld = (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
};

const listFiles = (req, res) => {
  const publicDir = path.join(__dirname, '..', 'public');
  try {
    const files = fs.readdirSync(publicDir);
    const fileDetails = files.map((file) => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        url: `/static/${file}`,
      };
    });
    res.status(200).json({ files: fileDetails });
  } catch (error) {
    res.status(500).json({ message: 'Error reading directory' });
  }
};

const uploadFile = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploadedFiles = req.files.map((file) => ({
    name: file.originalname,
    url: `/static/${file.originalname}`,
    size: file.size,
  }));

  res.status(201).json({
    message: `${req.files.length} file(s) uploaded successfully`,
    files: uploadedFiles,
  });
};

export { helloWorld, listFiles, uploadFile };
