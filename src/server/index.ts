import { ExtendedObject3D } from 'enable3d'
import geckos, { iceServers, ServerChannel } from '@geckos.io/server'
import { Ammo, Physics, ServerClock } from '@enable3d/ammo-on-nodejs'

const io1 = geckos({ iceServers })
io1.onConnection((channel: ServerChannel) => {})
io1.listen()

const io2 = require('socket.io')()
io2.on('connection', (client: any) => {})
io2.listen(3000)

const teleport = (box: ExtendedObject3D) => {
  box.body.setCollisionFlags(2)
  box.position.set(0, 2, 0)
  box.body.needUpdate = true
  box.body.once.update(() => {
    box.body.setCollisionFlags(0)
    box.body.setVelocity(0, 0, 0)
    box.body.setAngularVelocity(0, 0, 0)
  })
}

class ServerScene {
  physics = new Physics()
  box: ExtendedObject3D

  constructor() {
    this.create()
  }

  create() {
    this.physics.setGravity(0, -9.81 * 2, 0)

    // add ground
    this.physics.add.ground({
      y: -0.5,
      collisionFlags: 1,
      mass: 0,
      width: 20,
      height: 20,
    })

    // add box
    this.box = this.physics.add.box({ y: 20 })

    setInterval(() => {
      const x = (Math.random() - 0.5) * 8
      const y = (Math.random() - 0.5) * 8
      const z = (Math.random() - 0.5) * 8
      this.box.body.applyForce(x, 10, z)
      this.box.body.applyTorque(x * 4, y * 4, z * 4)
    }, 2000)

    // clock
    const clock = new ServerClock()
    clock.disableHighAccuracy()
    clock.onTick((delta: number) => this.update(delta))

    setInterval(() => this.send(), 1000 / 30)
  }

  send() {
    const { uuid, position: pos, quaternion: quat } = this.box

    const fixed = (n: number, f: number) => {
      return parseFloat(n.toFixed(f))
    }

    const updates = {
      uuid,

      pos: {
        x: fixed(pos.x, 2),
        y: fixed(pos.y, 2),
        z: fixed(pos.z, 2),
      },
      quat: {
        x: fixed(quat.x, 3),
        y: fixed(quat.y, 3),
        z: fixed(quat.z, 3),
        w: fixed(quat.w, 3),
      },
    }

    io1.emit('updates', updates)
    io2.emit('updates', updates)
  }

  update(delta: number) {
    const { position: pos } = this.box
    if (pos.y < -10) teleport(this.box)

    this.physics.update(delta * 1000)
  }
}

Ammo().then(() => {
  // @ts-ignore
  global.Ammo = Ammo
  new ServerScene()
})
