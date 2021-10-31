import { CharacterState, CHARACTER_UPDATE, Donation, PFTPSocketEventsMap, PigStateType } from '@pftp/common'
import Phaser from 'phaser'
import { Socket } from 'socket.io-client'

interface PigProps {
	texture: string
	x: number
	y: number
	pigLaugh: Phaser.Sound.BaseSound
}

export const PigAnimationKeys = {
	idle: 'idle',
	donation1: 'donation1',
	dragging: 'dragging',
}

export class Pig extends Phaser.GameObjects.Sprite {
	private behaviour: PigStateType | undefined
	private isLocked
	private pigLaugh

	constructor(
		scene: Phaser.Scene,
		options: PigProps,
		characterState: CharacterState,
		socket: Socket<PFTPSocketEventsMap>
	) {
		super(scene, options.x, options.y, options.texture)
		this.setName('pig')
		this.setScale(5)
		this.setIsVisible(characterState.isVisible)
		this.pigLaugh = options.pigLaugh
		this.isLocked = characterState.isLocked
		this.changeState('idle')

		this.setInteractive()
		scene.input.setDraggable(this)
		this.on('pointerout', () => {
			if (!this.isLocked) {
				this.changeState('idle')
				socket.emit(CHARACTER_UPDATE, {
					position: {
						x: this.x,
						y: this.y,
					},
				})
			}
		})
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		scene.input.on('drag', (_pointer: any, _gameObject: any, dragX: any, dragY: any) => {
			if (!this.isLocked) {
				if (this.anims.currentAnim.key !== 'dragging') {
					this.changeState('dragging')
				}
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
	public handleDonation(_donation: Donation, behaviour: PigStateType) {
		this.changeState(behaviour)

		this.playLaughSound()
	}

	private changeState(behaviour: PigStateType) {
		if (this.behaviour !== behaviour) {
			this.behaviour = behaviour

			if (this.behaviour !== 'idle' && behaviour !== 'dragging') {
				this.play(PigAnimationKeys.donation1).once('animationcomplete', () => {
					this.changeState('idle')
				})
			} else {
				this.play(this.behaviour)
			}
		}
	}

	public playLaughSound() {
		this.pigLaugh.play()
	}

	public setIsVisible(visible: boolean) {
		if (this.visible === visible) return
		this.visible = visible
	}
}
