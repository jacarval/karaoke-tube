var Fluxxor = require("fluxxor");
var constants = require("../resources/misc.js").constants;

var VideoStore = Fluxxor.createStore({

	initialize: function() {

		this.storeId = 0;
		this.videos = {};
		this.queueOrder = [];
		this.bindActions(		
			constants.ADD_VIDEO, this.onAddVideo,
			constants.REMOVE_VIDEO, this.onRemoveVideo,
			constants.CLEAR_VIDEOS, this.onClearVideos,
			constants.SADD_VIDEO, this.onServerAddVideo,
			constants.SREMOVE_VIDEO, this.onServerRemoveVideo,
			constants.SCLEAR_VIDEOS, this.onServerClearVideos
		);

		socket.emit("client:playlist:initialize");
	},

	onAddVideo: function(payload) {

		var storeId = this._nextStoreId();
		var video = {
				storeId: storeId,
				videoId: payload.videoId,
				title: payload.title,
				thumbnailUrl: payload.thumbnailUrl,
				selectedBy: payload.selectedBy
		};

		this.videos[storeId] = video;

		this.emit("change");
	},

	onServerAddVideo: function(payload) {

		this.onAddVideo(payload);

		socket.emit("client:playlist:add", payload);
	},


	onRemoveVideo: function(payload) {
		console.log("removing video");

		var storeId = payload.storeId;

		delete this.videos[storeId];

		this.emit("change");
	},

	onServerRemoveVideo: function(payload) {

		this.onRemoveVideo(payload);

		socket.emit("client:playlist:remove", payload);
	},

	onClearVideos: function() {

		var videos = this.videos;

		Object.keys(videos).forEach(function(key) {

			delete videos[key];
		});

		this.emit("change");
	},

	onServerClearVideos: function() {

		this.onClearVideos();

		socket.emit("client:playlist:clear");
	},

	getState: function() {

		return {selectedVideos: this.videos};
	},

	_nextStoreId: function() {

		return ++this.storeId;
	}
});

module.exports = VideoStore;