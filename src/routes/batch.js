const Version = mongoose.model('Version');
const Song = mongoose.model('Song');
import { addMp3 } from './streamer.js';
import mongoose from 'mongoose';


export const batch = (req, res) => {

    const { titles, versionName } = req.body;

    titles.forEach(title => {


        const newVersion = new Version({name: versionName, notes: versionNotes});

        const parentTitle = await Title.findOne({ _id: id }).populate('versions');
        let versionList = parentTitle.versions;

        if (req.body.versionCurrent) {
            try {
                let oldCurrent = versionList.find(v => v.current);
                if (oldCurrent) {
                    await Version.updateOne({_id: oldCurrent._id}, {current: false});
                }
                newVersion.current = true;
            } catch {
                req.session.errorMessage = 'There was an error updating the current tag.';
                res.redirect('/');
                break;
            }
        } else if (!versionList.find(v => v.current)) {
            newVersion.current = true;
        }

        try {
            await Title.updateOne({ _id: id }, {$push: { versions: newVersion }});
            await newVersion.save();
            res.redirect('/');
        } catch (err) {
            req.session.errorMessage = err.message;
            res.redirect('/');
        }
        break;




    // song




    // Increase timeout length for long uploads

    req.socket.setTimeout(10 * 60 * 1000);

    // Get parameters from post request and exit if there's an existing bounce with that date.

    const { songDate, songComments } = req.body;
    const vers = await Version.findOne({ _id: id });
    let duplicateDate = vers.songs.find(s => s.date === songDate);
    if (duplicateDate) {
        req.session.errorMessage = 'There is already a bounce with that date.'
        res.redirect('/');
        return;
    }

    // Create a new song object with the parameters we have

    const newSong = new Song({date: songDate, comments: songComments, length: req.files.songFile.size});

    try {

        // Create upload stream object
        const stream = addMp3(req.files.songFile);

        stream.on('error', (err) => {
            req.session.errorMessage = 'error uploading mp3';
            res.redirect('/');
        });

        // Finish up on completed upload
        stream.on('finish', async () => {

            // Get id of mp3 from stream object
            newSong.mp3 = stream.id;

            // Add song to parent version's song list
            await Version.updateOne({ _id: id }, {$push: { songs: newSong }});

            // Update the latest tag in the parent's song list
            const parentVersion = await Version.findOne({ _id: id }).populate('songs');
            let songList = parentVersion.songs;
            if (req.body.songLatest) {
                try {
                    let oldLatest = songList.find(s => s.latest);
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest._id}, {latest: false});
                    }
                    newSong.latest = true;
                } catch {
                    req.session.errorMessage = 'There was an error updating the latest tag.';
                    res.redirect('/');
                    return;
                }
            } else if (!songList.find(s => s.latest)) {
                newSong.latest = true;
            }

            // Finally save new song object
            await newSong.save();

            console.log('Uploaded & created song record:', newSong);
            res.redirect('/');
        });
        } catch (err) {
            req.session.errorMessage = err.message;
            res.redirect('/');
        }
    });
};