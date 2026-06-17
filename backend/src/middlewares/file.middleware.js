const multer = require('multer');

//The frontend accept=".pdf" is trivially bypassed, so enforce it here too
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },  //3MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Only PDF files are allowed.'), false)
        }
    }
});

module.exports = upload;