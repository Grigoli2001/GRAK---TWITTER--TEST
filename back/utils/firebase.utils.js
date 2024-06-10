const { getBucket } = require("../database/firebase_setup");

const maxSizes = {
  image: 5000000, // 5MB
  video: 50000000, // 50MB
};

const validateFiles = async (files) => {
  if (!files) {
    return null;
  }

  let filesArray = Object.values(files);
  if (!filesArray.length) {
    return null;
  }
  await import("file-type").then(async ({ fileTypeFromBuffer }) => {
    for (var file of filesArray) {
      file = file[0];
      if (!file) continue;
      const { mime } = await fileTypeFromBuffer(file.buffer);

      if (!mime || (!mime.startsWith("image") && !mime.startsWith("video"))) {
        throw new Error("Invalid file type");
      }
      if (file.size > maxSizes[mime.split("/")[0]]) {
        throw new Error("File too large");
      }
    }
  });

  console.log("File have been validated successfully");
  return files;
};

const deleteImagesInPath = async (bucket, userid, path) => {
  const folderPath = `${userid}/${path}`;
  const [files] = await bucket.getFiles({ prefix: folderPath });

  // Delete each file in the specified path
  await Promise.all(
    files.map(async (file) => {
      await file.delete();
      console.log(`Deleted file: ${file.name}`);
    })
  );

  console.log(`Deleted all images in path: ${folderPath}`);
};

// const firebaseUpload = async (file, userid, path) => {

//     if (!file) {
//         return null;
//       }

//       const bucket = getBucket();
//       const { originalname, buffer } = file;

//       if (!buffer) {
//         throw new Error("No image provided");
//       }
//       const filePath = `${userid}/${path}/${originalname}`;

//       const blob = bucket.file(filePath);
//       const blobStream = blob.createWriteStream({
//         resumable: false,
//         metadata: {
//           contentType: file.mimetype,
//         },
//       });

//       blobStream.on("error", (err) => {
//         console.log(err);
//         throw new Error("Error uploading image");
//       });

//     let publicUrl;
//       blobStream.on("finish", () => {
//         // deleteImagesInPath(bucket, userid, path);
//         publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
//         console.log("finished",publicUrl)
//       });

//       blobStream.end(buffer);
//     return publicUrl;
// };

const firebaseUpload = async (file, userid, path) => {
  if (!file) {
    return {
      media: null,
      mimeType: null,
    };
  }

  const bucket = getBucket();
  const { originalname, buffer } = file;
  console.log("file", file);
  console.log("buffer", buffer);
  console.log("originalname", originalname);

  if (!buffer) {
    throw new Error("No image provided");
  }
  const filePath = `${userid}/${path}/${originalname}`;

  const blob = bucket.file(filePath);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  let publicUrlPromise = new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      console.log(err);
      reject(new Error("Error uploading image"));
    });

    // deleteImagesInPath(bucket, userid, path);

    blobStream.on("finish", async () => {
      try {
        // Get a signed URL for the uploaded file
        const [signedUrl] = await blob.getSignedUrl({
          action: "read",
          expires: "03-09-2091",
        });

        console.log("finished", signedUrl);
        resolve({ media: signedUrl, mimeType: file.mimetype });
      } catch (err) {
        console.error("Error getting signed URL:", err);
        reject(new Error("Error getting signed URL"));
      }
    });

    blobStream.end(buffer);
  });

  return publicUrlPromise;
};

module.exports = { validateFiles, firebaseUpload };
