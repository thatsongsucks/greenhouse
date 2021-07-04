import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Title = mongoose.model('Title');
const Version = mongoose.model('Version');

const router = express.Router();

router.post('/versions', currentUser, requireAuth, async (req, res) => {

    const { versionName, versionNotes, parentId } = req.body;
    const newVersion = new Version({name: versionName, notes: versionNotes});

    const parentTitle = await Title.findOne({ _id: parentId }).populate('versions');
    let versionList = parentTitle.versions;

    if (req.body.versionCurrent) {


        let oldCurrent = versionList.find(v => v.current);
        if (oldCurrent) {
            await Version.updateOne({_id: oldCurrent._id}, {current: false});
        }
        newVersion.current = true;

    } else if (!versionList.find(v => v.current)) {
        newVersion.current = true;
    }
    parentTitle.versions.push(newVersion);
    await newVersion.save();
    await parentTitle.save();

    return res.status(201).send(newVersion);
});


router.get('/versions/:titleId', async (req, res) => {


    const title = await Title.findById(req.params.titleId).populate('versions');

    res.status(200).send(title.versions);


});

export { router as versionRouter };