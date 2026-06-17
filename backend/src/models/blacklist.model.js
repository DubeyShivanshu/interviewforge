const mongoose = require('mongoose');


const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, 'Token is required']
    },
}, {
    timestamps: true
});

// MongoDB will sweep expired documents automatically, keeping the collection small
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema);

module.exports = tokenBlacklistModel;