import { Project, Scene3D, ExtendedObject3D, THREE } from 'enable3d'
import geckos from '@geckos.io/client'
import io from 'socket.io-client'

class Geckos extends Scene3D {
  box: ExtendedObject3D
  geckos() {
    const channel = geckos()

    channel.onConnect(error => {
      if (error) {
        console.error(error.message)
        return
      }

      channel.on('updates', (updates: any) => {
        const u = updates
        if (this.box) {
          this.box.position.set(u.pos.x, u.pos.y, u.pos.z)
          this.box.quaternion.set(u.quat.x, u.quat.y, u.quat.z, u.quat.w)
        } else {
          this.box = this.add.box({}, { phong: { color: 'red' } })
        }
      })
    })
  }
  init() {
    this.setSize(window.innerWidth / 2, window.innerHeight)
    this.warpSpeed('-orbitControls')
    this.camera.position.set(0, 2, 10)
    this.camera.lookAt(0, 0, 0)
  }
  create() {
    this.geckos()
  }
  update() {
    if (this.box) {
      this.camera.position
        .copy(this.box.position)
        .add(new THREE.Vector3(0, 3, 7))
      this.camera.lookAt(this.box.position.clone())
    }
  }
}

class Socket extends Scene3D {
  box: ExtendedObject3D
  socket() {
    const socket = io(
      window.location.protocol + '//' + window.location.hostname + ':3000/'
    )
    socket.on('updates', (updates: any) => {
      const u = updates
      if (this.box) {
        this.box.position.set(u.pos.x, u.pos.y, u.pos.z)
        this.box.quaternion.set(u.quat.x, u.quat.y, u.quat.z, u.quat.w)
      } else {
        this.box = this.add.box({}, { phong: { color: 'red' } })
      }
    })
  }
  init() {
    this.setSize(window.innerWidth / 2, window.innerHeight)
    this.warpSpeed('-orbitControls')
    this.camera.position.set(0, 2, 10)
    this.camera.lookAt(0, 0, 0)
  }
  create() {
    this.socket()
  }
  update() {
    if (this.box) {
      this.camera.position
        .copy(this.box.position)
        .add(new THREE.Vector3(0, 3, 7))
      this.camera.lookAt(this.box.position.clone())
    }
  }
}
new Project({ scenes: [Geckos], parent: 'canvas1', antialias: true })
new Project({ scenes: [Socket], parent: 'canvas2', antialias: true })
