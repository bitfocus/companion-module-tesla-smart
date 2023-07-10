var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.CHOICES_PC = [
	{ id: '1', label: 'Source 1' },
	{ id: '2', label: 'Source 2' },
	{ id: '3', label: 'Source 3' },
	{ id: '4', label: 'Source 4' },
	{ id: '5', label: 'Source 5' },
	{ id: '6', label: 'Source 6' },
	{ id: '7', label: 'Source 7' },
	{ id: '8', label: 'Source 8' },
	{ id: '9', label: 'Source 9' },
	{ id: '10', label: 'Source 10' },
	{ id: '11', label: 'Source 11' },
	{ id: '12', label: 'Source 12' },
	{ id: '13', label: 'Source 13' },
	{ id: '14', label: 'Source 14' },
	{ id: '15', label: 'Source 15' },
	{ id: '16', label: 'Source 16' },
];

self.setVariableDefinitions( [
	{
		label: 'Current active HDMI port',
		name: "currentPort"
	}
] );

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.current_host_id = '0';
	self.polling = false;
	self.choices = self.CHOICES_PC.slice(0, self.config.sources);

	self.actions();

	// Connect to KVM device
	self.init_tcp();

	// Start polling for feedback
	self.start_polling_for_host();

	// Initialize the feedback workflow
	self.initFeedbacks();
};

// Reconnect to KVM after config updated, in case of IP or port change
instance.prototype.updateConfig = function(config) {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	self.choices = self.CHOICES_PC.slice(0, self.config.sources);

	self.actions();
	self.initFeedbacks();

	self.init_tcp();

	self.stop_polling_for_host();
	self.start_polling_for_host();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (chunk) {
			var data = Buffer.from(chunk);
			debug("Received ", data);

			self.processData(data);
		});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'KVM IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 2,
			default: 5000,
			regex: self.REGEX_PORT
		},
		{
			type: 'number',
			id: 'sources',
			label: '# of sources',
			min: 1,
			max: 16,
			default: 8,
			required: true
		},
		{
			type: 'number',
			id: 'poll',
			label: 'Feedback poll interval (ms) - 0 to disable, max 60000',
			min: 0,
			max: 60000,
			default: 5000,
			required: true
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	self.stop_polling_for_host();

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.actions = function() {
	var self = this;

	self.setActions({
		'switch': {
			label: 'Switch source',
			options: [
				{
					type: 'dropdown',
					id: 'id_send',
					label: 'Source:',
					default: '1',
					choices: self.choices
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	switch(action.action) {

		case 'switch':
			var id = action.options.id_send;
			if(id == '1') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x01,0xEE]);
			} else if(id == '2') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x02,0xEE]);
			} else if(id == '3') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x03,0xEE]);
			} else if(id == '4') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x04,0xEE]);
			} else if(id == '5') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x05,0xEE]);
			} else if(id == '6') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x06,0xEE]);
			} else if(id == '7') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x07,0xEE]);
			} else if(id == '8') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x08,0xEE]);
			} else if(id == '9') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x09,0xEE]);
			} else if(id == '10') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0A,0xEE]);
			} else if(id == '11') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0B,0xEE]);
			} else if(id == '12') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0C,0xEE]);
			} else if(id == '13') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0D,0xEE]);
			} else if(id == '14') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0E,0xEE]);
			} else if(id == '15') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x0F,0xEE]);
			} else if(id == '16') {
				cmd = Buffer.from([0xAA,0xBB,0x03,0x01,0x10,0xEE]);
			}
			break;
	}

	if (cmd !== undefined) {
		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
		}
		else {
			debug('Socket not connected :(');
		}
	}
}

instance.prototype.initFeedbacks = function() {
	var self = this;

	var feedbacks = {};

	feedbacks["current_host"] = {
		label : "Currently selected source",
		description : "Feedback showing the currently selected source",
		options : [
			{
				type : "colorpicker",
				label : "Background color",
				id : "bg_color",
				default : self.rgb(0, 255, 0)
			},
			{
				type : "dropdown",
				label : "Source",
				id : "host_id",
				default : '1',
				choices : self.choices
			}
		]
	}

	self.setFeedbackDefinitions(feedbacks);
}

instance.prototype.feedback = function(feedback) {
	switch (feedback.type) {
		case "current_host":
			if (feedback.options.host_id == this.current_host_id) {
				return {bgcolor : feedback.options.bg_color};
			}
	}
}

instance.prototype.poll_for_active_host = function() {
	var self = this;

	debug('Polling KVM ',self.config.host);

	if (self.socket !== undefined && self.socket.connected) {
		self.socket.send(Buffer.from([0xAA,0xBB,0x03,0x10,0x00,0xEE]));
	}
	else {
		debug('Socket not connected :(');
	}

	this.checkFeedbacks("current_host");
}

instance.prototype.start_polling_for_host = function() {
	var self = this;

	if(self.config.poll > 0) {
		self.host_poller = setInterval(self.poll_for_active_host.bind(self), self.config.poll);
		self.polling = true;

		self.poll_for_active_host();
		self.checkFeedbacks("current_host");
	}
}

instance.prototype.stop_polling_for_host = function() {
	var self = this;

	if(self.polling) {
		clearInterval(self.host_poller);
	}
}

instance.prototype.processData = function(data) {
	var self = this;

	if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x00,0x16])) == 0) {
		self.current_host_id = '1';
		self.setVariable('currentPort', '1');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x01,0x17])) == 0) {
		self.current_host_id = '2';
		self.setVariable('currentPort', '2');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x02,0x18])) == 0) {
		self.current_host_id = '3';
		self.setVariable('currentPort', '3');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x03,0x19])) == 0) {
		self.current_host_id = '4';
		self.setVariable('currentPort', '4');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x04,0x1A])) == 0) {
		self.current_host_id = '5';
		self.setVariable('currentPort', '5');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x05,0x1B])) == 0) {
		self.current_host_id = '6';
		self.setVariable('currentPort', '6');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x06,0x1C])) == 0) {
		self.current_host_id = '7';
		self.setVariable('currentPort', '7');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x07,0x1D])) == 0) {
		self.current_host_id = '8';
		self.setVariable('currentPort', '8');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x08,0x1E])) == 0) {
		self.current_host_id = '9';
		self.setVariable('currentPort', '9');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x09,0x1F])) == 0) {
		self.current_host_id = '10';
		self.setVariable('currentPort', '10');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0A,0x20])) == 0) {
		self.current_host_id = '11';
		self.setVariable('currentPort', '11');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0B,0x21])) == 0) {
		self.current_host_id = '12';
		self.setVariable('currentPort', '12');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0C,0x22])) == 0) {
		self.current_host_id = '13';
		self.setVariable('currentPort', '13');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0D,0x23])) == 0) {
		self.current_host_id = '14';
		self.setVariable('currentPort', '14');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0E,0x24])) == 0) {
		self.current_host_id = '15';
		self.setVariable('currentPort', '15');
	} else if(data.compare(Buffer.from([0xAA,0xBB,0x03,0x11,0x0F,0x25])) == 0) {
		self.current_host_id = '16';
		self.setVariable('currentPort', '16');
	}

	self.checkFeedbacks('current_host');
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
