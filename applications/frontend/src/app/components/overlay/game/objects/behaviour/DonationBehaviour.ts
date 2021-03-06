import { Donation } from '@pftp/common'
import {
	blueStarKey,
	donationAlertKey,
	donationAlertWithMessageKey,
	FIREWORKS_SOUND_1_AUDIO_KEY,
	FIREWORKS_SOUND_2_AUDIO_KEY,
	mainCoinKey,
	mainColor,
	pigDonationInKey,
	pigDonationKey,
	pigDonationOutKey,
	pigIdleKey,
	pigScratchKey,
	pigSleepKey,
	pigSleepOutKey,
	STAR_RAIN_SOUND_AUDIO_KEY,
} from '../../scenes/OverlayScene'
import { Coin } from '../containers/pig/Coin'
import { Star } from '../Star'
import { DonationAlert } from '../containers/donationalert/DonationBanner'
import { DonationAlertContainer, donationAlertContainerName } from '../containers/donationalert/DonationAlertContainer'
import { DonationAlertHeaderText } from '../containers/donationalert/DonationAlertHeaderText'
import { DonationAlertUserMessageText } from '../containers/donationalert/DonationAlertUserMessageText'
import { CoinTextAmount } from '../containers/pig/CoinTextAmount'
import { Pig } from '../containers/pig/Pig'
import { formatDonationAlertCurrenty } from '../../../../../lib/utils'
import { ALERT_FIREWORKS_MIN_AMOUNT, ALERT_STAR_RAIN_MIN_AMOUNT } from '../containers/donationalert/donationConfig'
const { FloatBetween } = Phaser.Math

export class DonationBehaviour {
	/**
	 * Checky every second if the queue has items and try
	 * start donation animation.
	 */
	private checkQueueTimerId: undefined | number
	private checkQueueTimer = 500
	private character: Pig
	private queue
	private coinGroup
	private starGroup
	private starFollowParticle
	private startPositionOffset = -350
	private fireworksEmitter

	constructor(
		character: Pig,
		queue: Donation[],
		coinGroup: Phaser.GameObjects.Group,
		starGroup: Phaser.GameObjects.Group,
		starFollowParticle: Phaser.GameObjects.Particles.ParticleEmitterManager,
		fireworksEmitter: Phaser.GameObjects.Particles.ParticleEmitter
	) {
		this.character = character
		this.queue = queue
		this.coinGroup = coinGroup
		this.starGroup = starGroup
		this.starFollowParticle = starFollowParticle
		this.fireworksEmitter = fireworksEmitter
		this.start()
	}

	public start() {
		this.checkQueueTimerId = window.setInterval(() => {
			if (this.isInDonationStartState()) {
				/**
				 * Default case when in Idle state.
				 */
				if (this.character.anims.currentAnim.key === pigIdleKey) {
					const donation = this.queue.shift()!
					this.character.anims.stopAfterRepeat(1)
					this.character.playLaughSound()
					this.character.play(pigDonationInKey).chain(pigDonationKey)
					this.triggerAlert(donation)
					/**
					 * Sleeping can be seen as another idle state from which the wakeUp
					 * animation needs to bestarted additional
					 */
				} else if (this.character.anims.currentAnim.key === pigSleepKey) {
					const donation = this.queue.shift()!
					this.character.anims.stopAfterRepeat(1)
					this.character.playLaughSound()
					this.character.play(pigSleepOutKey).chain(pigDonationInKey).chain(pigDonationKey)
					this.triggerAlert(donation)
				}
			}
		}, this.checkQueueTimer)
	}

	private isInDonationStartState() {
		return (
			this.queue.length > 0 &&
			this.character.anims.currentAnim.key !== pigDonationKey &&
			this.character.anims.currentAnim.key !== pigDonationInKey &&
			this.character.anims.currentAnim.key !== pigDonationOutKey &&
			this.character.anims.currentAnim.key !== pigScratchKey &&
			this.character.anims.currentAnim.key !== pigSleepOutKey
		)
	}

	private createAlertText(donation: Donation) {
		const donationAlertContainer = this.character.scene.children.getByName(
			donationAlertContainerName
		) as DonationAlertContainer
		const donationAlert = donation.message
			? (donationAlertContainer.getByName(donationAlertWithMessageKey) as DonationAlert)
			: (donationAlertContainer.getByName(donationAlertKey) as DonationAlert)

		this.createDonationAlertHeaderText(donation, donationAlert, donationAlertContainer)

		// only create userMessageText object if message is given
		if (donation.message) {
			this.createDonationAlertUserMessageText(donation, donationAlert, donationAlertContainer)
		}
		donationAlert.alpha = 1
	}

	private createDonationAlertHeaderText = (
		donation: Donation,
		donationAlert: DonationAlert,
		donationAlertContainer: DonationAlertContainer
	) => {
		const formatedDonationAmount = formatDonationAlertCurrenty(donation.amount)
		const donationAlertHeaderText = new DonationAlertHeaderText(
			this.character.scene,
			0,
			donationAlert.displayHeight - 240 * donationAlertContainer.scale,
			`${donation.user} spendet ${formatedDonationAmount}`,
			donationAlert.scale
		)
		donationAlertContainer.add(donationAlertHeaderText)
	}

	private createDonationAlertUserMessageText = (
		donation: Donation,
		donationAlert: DonationAlert,
		donationAlertContainer: DonationAlertContainer
	) => {
		const donationAlertUserMessageText = new DonationAlertUserMessageText(
			this.character.scene,
			donationAlert.x - (donationAlert.displayWidth / 2 - 50),
			donationAlert.displayHeight - 540 * donationAlertContainer.scale,
			donation.message,
			donationAlert.scale,
			donationAlert.displayWidth - 70 * donationAlertContainer.scale * 2
		)
		donationAlertContainer.add(donationAlertUserMessageText)
	}

	private triggerAlert(donation: Donation) {
		this.createAlert(donation)
		this.createAlertText(donation)
		this.createCoin(donation)
	}

	private createCoin(donation: Donation) {
		const coin = new Coin(this.character.scene, 0, this.startPositionOffset, mainCoinKey)
		const formatedDonationAmount = formatDonationAlertCurrenty(donation.amount)

		const coinText = new CoinTextAmount(
			this.character.scene,
			0,
			this.startPositionOffset,
			formatedDonationAmount,
			mainColor
		)

		this.character.parentContainer.add(coin)
		this.character.parentContainer.add(coinText)
		this.coinGroup.add(coin)
	}

	private createAlert(donation: Donation) {
		const { amount, message } = donation
		const donationAlertContainer = this.character.scene.children.getByName(
			donationAlertContainerName
		) as DonationAlertContainer
		const banner = message
			? donationAlertContainer.getByName(donationAlertWithMessageKey)
			: donationAlertContainer.getByName(donationAlertKey)

		if (donationAlertContainer && banner) {
			const donationBanner = banner as DonationAlert
			donationBanner.play()
			// Prevents video freeze when game is out of focus (i.e. user changes tab on the browser)
			donationBanner.setPaused(false)
			donationBanner.parentContainer.alpha = 1
		}

		if (amount >= ALERT_STAR_RAIN_MIN_AMOUNT) {
			this.character.scene.sound.play(STAR_RAIN_SOUND_AUDIO_KEY)
			this.character.scene.time.addEvent({
				callback: () => {
					for (let i = 0; i <= 3; i++) {
						this.starGroup.add(
							new Star(this.character.scene, Phaser.Math.Between(20, 1900), -100, blueStarKey, this.starFollowParticle)
						)
					}
				},
				callbackScope: this,
				delay: 200,
				repeat: 60,
			})
		} else if (amount >= ALERT_FIREWORKS_MIN_AMOUNT) {
			const { width, height } = this.character.scene.scale
			const positionTimer = this.character.scene.time.addEvent({
				repeat: -1,
				callback: () => {
					this.fireworksEmitter.setPosition(width * FloatBetween(0.25, 0.75), height * FloatBetween(0, 0.5))
				},
			})
			this.character.scene.time.addEvent({
				delay: 500,
				repeat: 0,
				callback: () => {
					this.fireworksEmitter.start()
				},
			})

			this.character.scene.time.addEvent({
				delay: 500,
				repeat: 0,
				callback: () => {
					this.character.scene.sound.play(FIREWORKS_SOUND_1_AUDIO_KEY)
				},
			})

			this.character.scene.time.addEvent({
				delay: 1500,
				repeat: 0,
				callback: () => {
					this.character.scene.sound.play(FIREWORKS_SOUND_1_AUDIO_KEY)
				},
			})

			this.character.scene.time.addEvent({
				delay: 2500,
				repeat: 0,
				callback: () => {
					this.character.scene.sound.play(FIREWORKS_SOUND_2_AUDIO_KEY)
				},
			})

			this.character.scene.time.addEvent({
				delay: 3500,
				repeat: 0,
				callback: () => {
					this.character.scene.sound.play(FIREWORKS_SOUND_1_AUDIO_KEY)
				},
			})

			this.character.scene.time.addEvent({
				delay: 4500,
				repeat: 0,
				callback: () => {
					this.character.scene.sound.play(FIREWORKS_SOUND_1_AUDIO_KEY)
				},
			})

			this.character.scene.time.addEvent({
				delay: 5000,
				repeat: 0,
				callback: () => {
					positionTimer.destroy()
					this.fireworksEmitter.stop()
				},
			})
		}
	}

	public stop() {
		window.clearInterval(this.checkQueueTimerId)
		this.checkQueueTimerId = undefined
	}

	public reset() {
		this.stop()
		this.start()
	}
}
