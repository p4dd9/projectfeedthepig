import { CharacterState, CHARACTER_UPDATE, Donation, PFTPSocketEventsMap } from '@pftp/common'
import Phaser from 'phaser'
import { Socket } from 'socket.io-client'
import { PIG_LAUGH_AUDIO_KEY } from '../scenes/OverlayScene'

interface PigProps {
	texture: string
	x: number
	y: number
}

export class Pig extends Phaser.GameObjects.Image {
	private isLocked

	constructor(
		scene: Phaser.Scene,
		options: PigProps,
		characterState: CharacterState,
		socket: Socket<PFTPSocketEventsMap>
	) {
		super(scene, options.x, options.y, options.texture)
		this.setName('pig')
		this.setScale(1)
		this.setIsVisible(characterState.isVisible)
		this.isLocked = characterState.isLocked

		this.setInteractive()
		scene.input.setDraggable(this)
		this.on('pointerout', () => {
			socket.emit(CHARACTER_UPDATE, {
				position: {
					x: this.x,
					y: this.y,
				},
			})
		})
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		scene.input.on('drag', (_pointer: any, _gameObject: any, dragX: any, dragY: any) => {
			if (!this.isLocked) {
				this.x = dragX
				this.y = dragY
			}
		})

		scene.physics.add.existing(this)
		this.handleState(characterState)
		scene.add.existing(this)
	}

	public handleState(state: CharacterState) {
		if (!this.isLocked) {
			this.x = state.position.x
			this.y = state.position.y
		}

		if (this.isLocked !== state.isLocked) {
			this.isLocked = state.isLocked
		}

		if (this.visible != state.isVisible) {
			this.setIsVisible(state.isVisible)
		}
	}

	/** placeholder function until pig handling with animations starts */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleDonation(_donation: Donation) {
		this.scene.sound.play(PIG_LAUGH_AUDIO_KEY)
		this.setScale(Math.random() + 1)
	}

	public setIsVisible(visible: boolean) {
		if (this.visible === visible) return
		this.visible = visible
	}
}
