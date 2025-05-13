const path = require('path');
module.exports = {
    DATABASE_URL: 'postgresql://db_notecook_owner:npg_HfedP15FlSiD@ep-dark-heart-a89z7n51-pooler.eastus2.azure.neon.tech/db_notecook?sslmode=require'
    ,JWT_SECRET : '123456'
    ,UPLOAD_DIR: path.join(__dirname, 'public')
    ,MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};
