// @ts-check
import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'

export const UpgradeScripts = [
	CreateConvertToBooleanFeedbackUpgradeScript({
		current_host: {
			bg_color: 'bgcolor',
		},
	}),
]
