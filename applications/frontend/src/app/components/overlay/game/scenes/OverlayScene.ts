import { DONATION_TRIGGER, GlobalState, PFTPSocketEventsMap, REQUEST_STATE, STATE_UPDATE } from '@pftp/common'

import Phaser, { Physics } from 'phaser'
import { Socket } from 'socket.io-client'
import { SCENES } from '../gameConfig'
import {
	DonationAlertContainer,
	donationAlertContainerName,
} from '../objects/containers/donationalert/DonationAlertContainer'
import { DonationAlert } from '../objects/containers/donationalert/DonationBanner'
import { PigContainer } from '../objects/containers/pig/OverlayContainer'
import { Pig } from '../objects/containers/pig/Pig'
import { Sign } from '../objects/containers/pig/Sign'
import { Star } from '../objects/Star'

const VOLUME_CHANGE_AUDIO_KEY = 'volumeChangeAudio'
const DONATION_ALERT_AUDIO_KEY = 'donationAlertAudio'

export const FIREWORKS_START_AUDIO_KEY = 'fireworksStartAudio'
export const FIREWORKS_SOUND_1_AUDIO_KEY = 'fireworksSound1Audio'
export const FIREWORKS_SOUND_2_AUDIO_KEY = 'fireworksSound2Audio'
export const STRAR_SOUND_AUDIO_KEY = 'starSound'
export const STAR_RAIN_SOUND_AUDIO_KEY = 'starRainAudio'

const signKey = 'sign'

export const blueStarKey = 'blueStar'
const whiteStarFollowerKey = 'whiteFollower'

export const mainCoinKey = 'mainCoin'
export const mainColor = '#005799'

export const donationAlertKey = 'donationAlertVideo'
export const donationAlertWithMessageKey = 'donationAlertWithMessageVideo'

const flaresAtlasKey = 'flaresAtlas'
const pigAtlasKey = 'pigAtlas'
const pigIdleFrame = 'idleFrame'
const pigSleepSpriteSheet = 'sleepFrame'
const pigScratchFrame = 'scratchFrame'
const pigDonationFrame = 'donationFrame'

export const pigIdleKey = 'idle'
export const pigSleepKey = 'sleep'
export const pigSleepInKey = 'sleepIn'
export const pigSleepOutKey = 'sleepOut'
export const pigScratchKey = 'scratch'
export const pigDonationKey = 'donation'
export const pigDonationInKey = 'donationIn'
export const pigDonationOutKey = 'donationOut'

const frameSize = 500
const coinSize = 500

// Inspired by https://codepen.io/samme/pen/eYEearb @sammee on github
const fireworksEmitterConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
	alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
	angle: { start: 0, end: 360, steps: 100 },
	blendMode: 'ADD',
	frame: { frames: ['red', 'yellow', 'blue'], cycle: true, quantity: 500 },
	frequency: 1000,
	gravityY: 600,
	lifespan: 1800,
	quantity: 500,
	reserve: 500,
	scale: { min: 0.02, max: 0.35 },
	speed: { min: 200, max: 600 },
	x: 550,
	y: 350,
}

export class OverlayScene extends Phaser.Scene {
	public pigWithSignContainer: PigContainer | null = null
	public donationBannerDontainer: DonationAlertContainer | null = null

	constructor() {
		super({ key: SCENES.OVERLAY })
	}

	init(config: { socket: Socket<PFTPSocketEventsMap>; initialState: GlobalState }) {
		config.socket.on(STATE_UPDATE, (state) => {
			this.pigWithSignContainer?.handleState(state.character)
			const pig = this.pigWithSignContainer?.getByName('pig')
			if (pig) {
				const char = pig as Pig
				char.handleState(state.character)
			}

			this.donationBannerDontainer?.handleState(state.donationAlert)

			/**
			 * Somehow numbers with decimals end up having more decimals
			 * than assigned, therefore it is rounded to one decimal.
			 */
			const normalizedSoundValue = Math.round(this.sound.volume * 10) / 10
			if (normalizedSoundValue !== state.settings.volume) {
				this.sound.volume = state.settings.volume
				this.sound.play(VOLUME_CHANGE_AUDIO_KEY)
			}
		})

		config.socket.on(DONATION_TRIGGER, (donation) => {
			const pig = this.pigWithSignContainer?.getByName('pig') as Pig
			pig.handleDonation(donation)
		})
	}

	preload() {
		// VIDEOS
		this.load.video(donationAlertKey, '/game/donationalert/donation_alert.webm', 'loadeddata', false, true)
		this.load.video(
			donationAlertWithMessageKey,
			'/game/donationalert/donation_alert_with_message.webm',
			'loadeddata',
			false,
			true
		)

		// ATLAS, SPRITESHEETS & IMAGES
		this.load.atlas(pigAtlasKey, '/game/pig_atlas.png', '/game/pig_atlas.json')
		this.load.atlas(flaresAtlasKey, '/game/flares.png', '/game/flares.json')
		this.load.spritesheet(blueStarKey, '/game/stars/blue_star.png', {
			frameWidth: 250,
			frameHeight: 250,
		})
		this.load.image(whiteStarFollowerKey, '/game/stars/star_flare.png')
		this.load.spritesheet(signKey, '/game/sign.png', {
			frameWidth: 500,
			frameHeight: 500,
		})
		this.load.spritesheet(mainCoinKey, `/game/coins/cr2021_coin.png`, {
			frameWidth: coinSize,
			frameHeight: coinSize,
		})

		// AUDIO ASSETS
		this.load.audio(VOLUME_CHANGE_AUDIO_KEY, '/audio/volume_change.wav')
		this.load.audio(DONATION_ALERT_AUDIO_KEY, '/audio/donation_alert.mp3')
		this.load.audio(FIREWORKS_START_AUDIO_KEY, '/audio/fireworks.ogg')
		this.load.audio(FIREWORKS_SOUND_1_AUDIO_KEY, '/audio/fireworks_sound_1.ogg')
		this.load.audio(FIREWORKS_SOUND_2_AUDIO_KEY, '/audio/fireworks_sound_2.ogg')
		this.load.audio(STAR_RAIN_SOUND_AUDIO_KEY, '/audio/star_rain.ogg')
	}

	create(config: { socket: Socket<PFTPSocketEventsMap>; initialState: GlobalState }) {
		const { socket, initialState } = config

		this.textures.addSpriteSheetFromAtlas(pigIdleFrame, {
			atlas: pigAtlasKey,
			frame: 'idle',
			frameWidth: frameSize,
			frameHeight: frameSize,
		})

		this.textures.addSpriteSheetFromAtlas(pigScratchFrame, {
			atlas: pigAtlasKey,
			frame: 'scratch',
			frameWidth: frameSize,
			frameHeight: frameSize,
		})

		this.textures.addSpriteSheetFromAtlas(pigDonationFrame, {
			atlas: pigAtlasKey,
			frame: 'donation',
			frameWidth: frameSize,
			frameHeight: frameSize,
		})

		this.textures.addSpriteSheetFromAtlas(pigSleepSpriteSheet, {
			atlas: pigAtlasKey,
			frame: 'sleep',
			frameWidth: frameSize,
			frameHeight: frameSize,
		})

		const pigIdleConfig: Phaser.Types.Animations.Animation = {
			key: pigIdleKey,
			frames: this.anims.generateFrameNumbers(pigIdleFrame, { end: 21 }),
			duration: 3750,
			repeat: -1,
		}

		const pigDonationInConfig: Phaser.Types.Animations.Animation = {
			key: pigDonationInKey,
			frames: this.anims.generateFrameNumbers(pigDonationFrame, { start: 0, end: 8 }),
			duration: 1000,
			repeat: 0,
		}

		const pigDonationConfig: Phaser.Types.Animations.Animation = {
			key: pigDonationKey,
			frames: this.anims.generateFrameNumbers(pigDonationFrame, { start: 9, end: 10 }),
			duration: 200,
			repeat: -1,
		}

		const pigDonationOutConfig: Phaser.Types.Animations.Animation = {
			key: pigDonationOutKey,
			frames: this.anims.generateFrameNumbers(pigDonationFrame, { start: 11, end: 17 }),
			duration: 1000,
			repeat: 0,
		}

		const pigScratchConfig: Phaser.Types.Animations.Animation = {
			key: pigScratchKey,
			frames: this.anims.generateFrameNumbers(pigScratchFrame, { end: 12 }),
			duration: 1800,
			repeat: 0,
		}

		const pigSleepInConfig: Phaser.Types.Animations.Animation = {
			key: pigSleepInKey,
			frames: this.anims.generateFrameNumbers(pigSleepSpriteSheet, { start: 0, end: 8 }),
			duration: 1200,
			repeat: 0,
		}

		const pigSleepConfig: Phaser.Types.Animations.Animation = {
			key: pigSleepKey,
			frames: this.anims.generateFrameNumbers(pigSleepSpriteSheet, { start: 9, end: 17 }),
			duration: 1500,
			repeat: -1,
		}

		const pigSleepOutConfig: Phaser.Types.Animations.Animation = {
			key: pigSleepOutKey,
			frames: this.anims.generateFrameNumbers(pigSleepSpriteSheet, { start: 17, end: 21 }),
			duration: 700,
			repeat: 0,
		}

		this.anims.create(pigIdleConfig)
		this.anims.create(pigSleepConfig)
		this.anims.create(pigSleepInConfig)
		this.anims.create(pigSleepOutConfig)
		this.anims.create(pigScratchConfig)
		this.anims.create(pigDonationConfig)
		this.anims.create(pigDonationInConfig)
		this.anims.create(pigDonationOutConfig)

		const coinGroup = this.add.group()
		const starGroup = this.add.group()

		const flareParticles = this.add.particles(flaresAtlasKey)

		// TODO: move emitter logic to donationbehaviour class
		const fireworksEmitter = flareParticles.createEmitter(fireworksEmitterConfig)
		fireworksEmitter.stop()

		this.createStarRainInstance(starGroup)

		// create pig container items
		const sign = new Sign(this, -175, 0, signKey)
		const pig = new Pig(
			this,
			{ x: 0, y: 0, texture: pigAtlasKey, pigLaugh: this.sound.add(DONATION_ALERT_AUDIO_KEY) },
			initialState.character,
			coinGroup,
			starGroup,
			this.add.particles(whiteStarFollowerKey),
			fireworksEmitter
		)

		// create donationAlerts
		const dontainerBanner = new DonationAlert(this, 0, 0, initialState.donationAlert, donationAlertKey)
		const donationAlertWithMessage = new DonationAlert(
			this,
			0,
			0,
			initialState.donationAlert,
			donationAlertWithMessageKey
		)

		// create containers
		this.donationBannerDontainer = new DonationAlertContainer(this, initialState.donationAlert, socket, {
			children: [dontainerBanner, donationAlertWithMessage],
		})
		this.pigWithSignContainer = new PigContainer(this, initialState.character, socket, {
			children: [sign, pig],
		})
		this.input.setDraggable([this.pigWithSignContainer, this.donationBannerDontainer])

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.input.on('drag', (_pointer: any, _gameObject: any, dragX: any, dragY: any) => {
			if (_gameObject.name === 'pigcontainer' && !_gameObject.isLocked) {
				_gameObject.x = dragX
				_gameObject.y = dragY
			} else if (_gameObject.name === donationAlertContainerName) {
				_gameObject.x = dragX
				_gameObject.y = dragY
			}
		})

		// global world env objects and settings
		this.sound.pauseOnBlur = false
		this.addMouthCollider(this.pigWithSignContainer, coinGroup)

		socket.emit(REQUEST_STATE)
	}

	private createStarRainInstance(starGroup: Phaser.GameObjects.Group) {
		const { height } = this.scale

		const starColliderSprite = new Phaser.Physics.Arcade.Sprite(this, 960, height + 40, blueStarKey)
		const physicsBody = new Physics.Arcade.Body(this.physics.world, starColliderSprite)
		physicsBody.setSize(1920, 10)
		physicsBody.allowGravity = false
		physicsBody.immovable = true
		starColliderSprite.body = physicsBody

		this.physics.add.existing(starColliderSprite)
		this.physics.world.setBoundsCollision(true, true, false, false)
		this.physics.add.collider(starGroup, starColliderSprite, (gameObject1) => {
			const star = gameObject1 as Star
			star.setVelocityX(Phaser.Math.Between(-200, 200))

			if (star.bumps >= 1) {
				star.starEmitter.killAll()
				star.starEmitter.remove()
				star.destroy()
			} else {
				star.bumps += 1
			}
		})
	}

	public addMouthCollider(container: Phaser.GameObjects.Container, coinGroup: Phaser.GameObjects.Group) {
		const colliderSprite = new Phaser.GameObjects.Sprite(this, 0, 0, mainCoinKey)
		const physicsBody = new Physics.Arcade.Body(this.physics.world, colliderSprite)

		colliderSprite.body = physicsBody
		colliderSprite.setVisible(false)
		colliderSprite.body.allowGravity = false
		colliderSprite.body.setSize(170, 170)
		colliderSprite.name = 'colliderSprite'

		const target = this.physics.add.existing(colliderSprite)
		container.add(colliderSprite)

		this.physics.add.overlap(
			coinGroup,
			target,
			(currentGameObject) => {
				currentGameObject.destroy()
				const pig = container.getByName('pig') as Pig
				/// this.sound.play(PIG_NOM_NOM_AUDIO_KEY)
				pig.play(pigDonationOutKey).chain(pigIdleKey)

				container.getAll('name', 'cointext').map((el) => el.destroy())
			},
			undefined,
			coinGroup
		)
	}
}
