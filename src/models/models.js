import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const songSchema = new Schema({
    date: { type: Date, default: Date.now() },
    latest: { type: Boolean, default: false },
    comments: String,
    mp3: String,
    size: Number,
    duration: Number
});

const versionSchema = new Schema({
    name: { type: String },
    current: { type: Boolean, default: false },
    notes: String,
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song'}]
});

const titleSchema = new Schema({
    title: { type: String, unique: true },
    versions: [{ type: Schema.Types.ObjectId, ref: 'Version'}],
});

const tierSchema = new Schema({
    name: String,
    trackList: [{ type: Schema.Types.ObjectId, ref: 'Title'}],
    position: Number
});

const playlistSongSchema = new Schema({
    title: { type: Schema.Types.ObjectId, ref: 'Title'},
    version: { type: Schema.Types.ObjectId, ref: 'Version'},
    position: Number,
    bounce: { type: Schema.Types.ObjectId, ref: 'Song'}
});

const playlistSchema = new Schema({
    name: { type: String, unique: true },
    position: Number,
    songs: [{ type: Schema.Types.ObjectId, ref: 'PlaylistSong'}],
    notes: String
});


mongoose.model('Tier', tierSchema);
mongoose.model('Title', titleSchema);
mongoose.model('Version', versionSchema);
mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

export { Playlist, PlaylistSong };