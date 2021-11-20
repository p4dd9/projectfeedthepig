import { Donation } from '@pftp/common'
import {
	coin1Key,
	coin2Key,
	coin3Key,
	coin4Key,
	coin5Key,
	coin6Key,
	coin7Key,
	coin8Key,
	pigDonationInKey,
	pigDonationKey,
	pigDonationOutKey,
	pigIdleKey,
	pigScratchKey,
	pigSleepKey,
	pigSleepOutKey,
} from '../../scenes/OverlayScene'
import { Coin } from '../Coin'
import { Pig } from '../Pig'

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

	constructor(character: Pig, queue: Donation[], coinGroup: Phaser.GameObjects.Group) {
		this.character = character
		this.queue = queue
		this.coinGroup = coinGroup
		this.start()
	}

	public start() {
		this.checkQueueTimerId = window.setInterval(() => {
			if (this.isInDonationStartState()) {
				/**
				 * Default case when in Idle state.
				 */
				if (this.character.anims.currentAnim.key === pigIdleKey) {
					const donation = this.queue.pop()!
					this.character.anims.stopAfterRepeat(1)
					this.character.play(pigDonationInKey).chain(pigDonationKey)
					this.createCoin(donation, this.coinGroup)
					/**
					 * Sleeping can be seen as another idle state from which the wakeUp
					 * animation needs to bestarted additional
					 */
				} else if (this.character.anims.currentAnim.key === pigSleepKey) {
					const donation = this.queue.pop()!
					this.character.anims.stopAfterRepeat(1)
					this.character.play(pigSleepOutKey).chain(pigDonationInKey).chain(pigDonationKey)
					this.createCoin(donation, this.coinGroup)
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

	private createCoin(donation: Donation, coinGroup: Phaser.GameObjects.Group) {
		const coin = new Coin(this.character.scene, 0, -350, this.getCoinKeyFromAmount(donation.amount))

		this.character.parentContainer.add(coin)
		coinGroup.add(coin)
	}

	private getCoinKeyFromAmount(amount: number) {
		if (amount >= 1000) {
			return coin8Key
		} else if (amount >= 500) {
			return coin7Key
		} else if (amount >= 250) {
			return coin6Key
		} else if (amount >= 100) {
			return coin5Key
		} else if (amount >= 50) {
			return coin4Key
		} else if (amount >= 10) {
			return coin3Key
		} else if (amount >= 2) {
			return coin2Key
		} else {
			return coin1Key
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