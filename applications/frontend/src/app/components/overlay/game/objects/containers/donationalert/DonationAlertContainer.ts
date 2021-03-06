import { DonationAlertState, DONATION_ALERT_UPDATE, PFTPSocketEventsMap } from '@pftp/common'
import { Socket } from 'socket.io-client'
import { donationAlertKey, donationAlertWithMessageKey } from '../../../scenes/OverlayScene'
import { DonationAlertHeaderText, donationAlertHeaderTextName } from './DonationAlertHeaderText'
import { DonationAlertUserMessageText, donationAlertUserMessageTextName } from './DonationAlertUserMessageText'
import { DonationAlert } from './DonationBanner'

interface ContainerOptions {
	x?: number | undefined
	y?: number | undefined
	children?: Phaser.GameObjects.GameObject[] | undefined
}

export const donationAlertContainerName = 'donationalertcontainer'
export class DonationAlertContainer extends Phaser.GameObjects.Container {
	constructor(
		scene: Phaser.Scene,
		state: DonationAlertState,
		socket: Socket<PFTPSocketEventsMap>,
		options: ContainerOptions | undefined
	) {
		super(scene, options?.x, options?.y, options?.children)
		this.name = donationAlertContainerName
		this.setSize(500, 900)
		this.setScale(state.scale)
		this.setIsVisible(state.isVisible)
		this.setPosition(1920 / 2, 100)

		this.setInteractive()
		this.on('dragend', () => {
			socket.emit(DONATION_ALERT_UPDATE, {
				position: {
					x: this.x,
					y: this.y,
				},
			})
		})

		this.handleState(state)
		scene.add.existing(this)
	}

	public handleState(state: DonationAlertState) {
		this.setIsVisible(state.isVisible)

		if (this.x !== state.position.x || this.y !== state.position.y) {
			this.x = state.position.x
			this.y = state.position.y
		}

		if (this.scale != state.scale) {
			this.setScale(state.scale)
			this.scaleContainerItems(state)

			this.scaleDonationHeaderText()
			this.scaleDonationUserMessageText()
		}
	}

	private scaleContainerItems = (state: DonationAlertState) => {
		const containerItems = this.getAll() as DonationAlert[]
		containerItems.map((items) => items.setScale(state.scale))
	}

	private scaleDonationHeaderText = () => {
		const donationAlertHeaderText = this.getByName(donationAlertHeaderTextName) as DonationAlertHeaderText
		const donationAlert = this.getByName(donationAlertKey) as DonationAlert

		if (donationAlert && donationAlertHeaderText) {
			donationAlertHeaderText.setY(donationAlert.displayHeight - 240 * this.scale)
		}
	}

	private scaleDonationUserMessageText = () => {
		const donationAlertHeaderText = this.getByName(donationAlertHeaderTextName) as DonationAlertHeaderText
		const donationAlert = this.getByName(donationAlertKey) as DonationAlert
		const bannerWithMessage = this.getByName(donationAlertWithMessageKey) as DonationAlert
		const donationAlertUserMessageText = this.getByName(
			donationAlertUserMessageTextName
		) as DonationAlertUserMessageText

		if (bannerWithMessage && donationAlertUserMessageText && donationAlert && donationAlertHeaderText) {
			donationAlertHeaderText.setY(donationAlert.displayHeight - 240 * this.scale)
			donationAlertUserMessageText.setPosition(
				bannerWithMessage.x - (bannerWithMessage.displayWidth / 2 - 50),
				bannerWithMessage.displayHeight - 540 * this.scale
			)
			donationAlertUserMessageText.setWordWrapWidth(
				donationAlert.displayWidth - 70 * bannerWithMessage.parentContainer.scale * 2
			)
		}
	}

	public setIsVisible(visible: boolean) {
		if (this.visible === visible) return
		this.visible = visible
	}
}
