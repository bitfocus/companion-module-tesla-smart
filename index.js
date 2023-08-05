const tcp = require('../../tcp')
const instance_skel = require('../../instance_skel')

const CHOICES_PC = [
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
]

class instance extends instance_skel {
	init() {
		this.current_host_id = '0'
		this.setVariable('currentPort', '0')
		this.polling = false
		this.choices = CHOICES_PC.slice(0, this.config.sources)

		this.actions()

		// Connect to KVM device
		this.init_tcp()

		// Start polling for feedback
		this.start_polling_for_host()

		// Initialize the feedback workflow
		this.initFeedbacks()
	}

	// Reconnect to KVM after config updated, in case of IP or port change
	updateConfig(config) {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		this.config = config
		this.choices = CHOICES_PC.slice(0, this.config.sources)

		this.actions()
		this.initFeedbacks()

		this.initVariables()

		this.init_tcp()

		this.stop_polling_for_host()
		this.start_polling_for_host()
	}

	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		this.status(this.STATE_WARNING, 'Connecting')

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.status(status, message)
			})

			this.socket.on('error', (err) => {
				this.debug('Network error', err)
				this.status(this.STATE_ERROR, err)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('connect', () => {
				this.status(this.STATE_OK)
				this.debug('Connected')
			})

			this.socket.on('data', (chunk) => {
				const data = Buffer.from(chunk)
				this.debug('Received ', data)

				this.processData(data)
			})
		}
	}

	// Return config fields for web config
	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'KVM IP',
				width: 6,
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 2,
				default: 5000,
				regex: this.REGEX_PORT,
			},
			{
				type: 'number',
				id: 'sources',
				label: '# of sources',
				min: 1,
				max: 16,
				default: 8,
				required: true,
			},
			{
				type: 'number',
				id: 'poll',
				label: 'Feedback poll interval (ms) - 0 to disable, max 60000',
				min: 0,
				max: 60000,
				default: 5000,
				required: true,
			},
		]
	}

	// When module gets deleted
	destroy() {
		this.stop_polling_for_host()

		if (this.socket) {
			this.socket.destroy()
		}
	}

	actions() {
		this.setActions({
			switch: {
				label: 'Switch source',
				options: [
					{
						type: 'dropdown',
						id: 'id_send',
						label: 'Source:',
						default: '1',
						choices: this.choices,
					},
				],
			},
		})
	}

	action(action) {
		let cmd

		switch (action.action) {
			case 'switch':
				let id = action.options.id_send
				if (id == '1') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x01, 0xee])
				} else if (id == '2') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x02, 0xee])
				} else if (id == '3') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x03, 0xee])
				} else if (id == '4') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x04, 0xee])
				} else if (id == '5') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x05, 0xee])
				} else if (id == '6') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x06, 0xee])
				} else if (id == '7') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x07, 0xee])
				} else if (id == '8') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x08, 0xee])
				} else if (id == '9') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x09, 0xee])
				} else if (id == '10') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0a, 0xee])
				} else if (id == '11') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0b, 0xee])
				} else if (id == '12') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0c, 0xee])
				} else if (id == '13') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0d, 0xee])
				} else if (id == '14') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0e, 0xee])
				} else if (id == '15') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x0f, 0xee])
				} else if (id == '16') {
					cmd = Buffer.from([0xaa, 0xbb, 0x03, 0x01, 0x10, 0xee])
				}
				break
		}

		if (cmd !== undefined) {
			this.debug('sending ', cmd, 'to', this.config.host)

			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send(cmd)
			} else {
				this.debug('Socket not connected :(')
			}
		}
	}

	initVariables() {
		this.setVariableDefinitions([
			{
				label: 'Current active HDMI port',
				name: 'currentPort',
			},
		])
	}

	initFeedbacks() {
		const feedbacks = {}

		feedbacks['current_host'] = {
			label: 'Currently selected source',
			description: 'Feedback showing the currently selected source',
			options: [
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg_color',
					default: this.rgb(0, 255, 0),
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'host_id',
					default: '1',
					choices: this.choices,
				},
			],
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	feedback(feedback) {
		switch (feedback.type) {
			case 'current_host':
				if (feedback.options.host_id == this.current_host_id) {
					return { bgcolor: feedback.options.bg_color }
				}
		}
	}

	poll_for_active_host() {
		this.debug('Polling KVM ', this.config.host)

		if (this.socket && this.socket.connected) {
			this.socket.send(Buffer.from([0xaa, 0xbb, 0x03, 0x10, 0x00, 0xee]))
		} else {
			this.debug('Socket not connected :(')
		}

		this.checkFeedbacks('current_host')
	}

	start_polling_for_host() {
		if (this.config.poll > 0) {
			this.host_poller = setInterval(this.poll_for_active_host.bind(this), this.config.poll)
			this.polling = true

			this.poll_for_active_host()
			this.checkFeedbacks('current_host')
		}
	}

	stop_polling_for_host() {
		if (this.polling) {
			clearInterval(this.host_poller)
		}
	}

	processData(data) {
		if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x00, 0x16])) == 0) {
			this.current_host_id = '1'
			this.setVariable('currentPort', '1')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x01, 0x17])) == 0) {
			this.current_host_id = '2'
			this.setVariable('currentPort', '2')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x02, 0x18])) == 0) {
			this.current_host_id = '3'
			this.setVariable('currentPort', '3')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x03, 0x19])) == 0) {
			this.current_host_id = '4'
			this.setVariable('currentPort', '4')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x04, 0x1a])) == 0) {
			this.current_host_id = '5'
			this.setVariable('currentPort', '5')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x05, 0x1b])) == 0) {
			this.current_host_id = '6'
			this.setVariable('currentPort', '6')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x06, 0x1c])) == 0) {
			this.current_host_id = '7'
			this.setVariable('currentPort', '7')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x07, 0x1d])) == 0) {
			this.current_host_id = '8'
			this.setVariable('currentPort', '8')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x08, 0x1e])) == 0) {
			this.current_host_id = '9'
			this.setVariable('currentPort', '9')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x09, 0x1f])) == 0) {
			this.current_host_id = '10'
			this.setVariable('currentPort', '10')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0a, 0x20])) == 0) {
			this.current_host_id = '11'
			this.setVariable('currentPort', '11')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0b, 0x21])) == 0) {
			this.current_host_id = '12'
			this.setVariable('currentPort', '12')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0c, 0x22])) == 0) {
			this.current_host_id = '13'
			this.setVariable('currentPort', '13')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0d, 0x23])) == 0) {
			this.current_host_id = '14'
			this.setVariable('currentPort', '14')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0e, 0x24])) == 0) {
			this.current_host_id = '15'
			this.setVariable('currentPort', '15')
		} else if (data.compare(Buffer.from([0xaa, 0xbb, 0x03, 0x11, 0x0f, 0x25])) == 0) {
			this.current_host_id = '16'
			this.setVariable('currentPort', '16')
		}

		this.checkFeedbacks('current_host')
	}
}

exports = module.exports = instance
