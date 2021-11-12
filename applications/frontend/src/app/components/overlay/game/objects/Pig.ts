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
	sleep: 'sleep',
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
		this.setScale(characterState.scale)
		this.setIsVisible(characterState.isVisible)
		this.pigLaugh = options.pigLaugh
		this.isLocked = characterState.isLocked
		this.flipX = characterState.flipX
		this.changeState('idle')

		this.setInteractive()
		scene.input.setDraggable(this)
		this.on('dragend', () => {
			if (!this.isLocked) {
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
				this.x = dragX
				this.y = dragY
			}
		})

		scene.physics.add.existing(this)
		this.handleState(characterState)
		scene.add.existing(this)
	}

	public handleState(state: CharacterState) {
		if (!this.isLocked && (this.x !== state.position.x || this.y !== state.position.y)) {
			this.x = state.position.x
			this.y = state.position.y
		}

		if (this.isLocked !== state.isLocked) {
			this.isLocked = state.isLocked
		}

		if (this.visible != state.isVisible) {
			this.setIsVisible(state.isVisible)
		}

		if (this.scale != state.scale) {
			this.setScale(state.scale)
		}

		if (this.flipX != state.flipX) {
			this.flipX = state.flipX
		}
	}

	/** placeholder function until pig handling with animations starts */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleDonation(_donation: Donation, behaviour: PigStateType) {
		this.changeState(behaviour)

		this.playLaughSound()
	}

	private changeState(newBehaviour: PigStateType) {
		if (this.behaviour !== newBehaviour) {
			this.behaviour = newBehaviour

			if (this.behaviour !== 'idle') {
				this.play(PigAnimationKeys.sleep).once('animationcomplete', () => {
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
