export class Star extends Phaser.Physics.Arcade.Sprite {
	public bumps = 0
	public starEmitter

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string | Phaser.Textures.Texture,
		followParticle: Phaser.GameObjects.Particles.ParticleEmitterManager
	) {
		super(scene, x, y, texture)
		scene.add.existing(this)
		scene.physics.add.existing(this)

		this.setDepth(-10)
		this.setScale(Phaser.Math.Between(25, 50) / 100)
		this.setBounce(Phaser.Math.Between(2, 50) / 100)
		this.setCollideWorldBounds(true)

		scene.tweens.add({
			targets: this,
			duration: Phaser.Math.Between(1500, 3000),
			repeat: -1,
			angle: 360,
		})

		this.starEmitter = followParticle.createEmitter({
			frequency: 7,
			radial: false,
			alpha: 0.2,
			lifespan: 2000,
			maxParticles: 200,
			scale: 0.5,
		})
		this.starEmitter.startFollow(this)
	}
}
