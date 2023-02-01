import * as THREE from 'three'

export namespace Water {
    export interface WaterGunParams {
        a: THREE.Vector3; // 加速度
        v: THREE.Vector3[]; // 初速度
        p: THREE.Vector3[]; // 初位置
        ground: THREE.Plane; // 地面位置
        Epsilon: number; // 时间步长
        countPerGroup: number; // 每组粒子数

        size: number; // 粒子大小
        color: THREE.Color[]; // 粒子颜色

        shake_position: number; // 抖动位置
        shake_speed: number; // 抖动速度
        shake_time: number; // 抖动时间
        shake_size: number; // 抖动大小

    }

    const defaultParams: WaterGunParams = {
        a: new THREE.Vector3(0, -9.8, 0),
        v: [new THREE.Vector3(0, 0, 0)],
        p: [new THREE.Vector3(0, 0, 0)],
        ground: new THREE.Plane(new THREE.Vector3(0, 1, 0), -1),
        countPerGroup: 10,
        Epsilon: 1 / 100,// 越小越慢

        size: .5,
        color: [
            new THREE.Color("#039BE5"),
            new THREE.Color("#039BE5"),
            // new THREE.Color("#EF6C00"),
            
            new THREE.Color("#F5F5F5")
        ],

        shake_position: 0.1,
        shake_speed: 0.5,
        shake_time: 0.1,
        shake_size: 1
    }

    export class WaterGun {
        params: WaterGunParams = defaultParams
        particlesGeometry!: THREE.BufferGeometry;

        perWaterPipeGroupCount: number = 0;
        T:number[] = [0,0];

        constructor(params?: WaterGunParams) {
            if (params) {
                this.params = Object.assign(this.params, params);
            }
        }

        _createOneWaterPipe(p0: THREE.Vector3, v0: THREE.Vector3, groupCount: number, perGrpupTimeGap: number, positionShake: number, speedShake: number, timeShake: number) {
            const positions: any[] = [];
            const times: any[] = [];
            const speeds: any[] = [];

            const sizes: any[] = [];
            const colors: any[] = [];

            const startT = 0;            
            for (let i = 0; i < groupCount; i++) {
                let T = startT + i * perGrpupTimeGap;
                for (let j = 0; j < this.params.countPerGroup; j++) {
                    let x = p0.x + (Math.random() - 0.5) * positionShake;
                    let y = p0.y + (Math.random() - 0.5) * positionShake;
                    let z = p0.z + (Math.random() - 0.5) * positionShake;
                    positions.push(x, y, z)
                    sizes.push(this.params.size + (Math.random() - 0.5) * this.params.shake_size)
                    times.push(T + (Math.random() - 0.5) * timeShake)
                    speeds.push(v0.x + (Math.random() - 0.5) * speedShake, v0.y + (Math.random() - 0.5) * speedShake, v0.z + (Math.random() - 0.5) * speedShake)

                    // random color
                    let color = this.params.color[Math.floor(Math.random() * this.params.color.length)]
                    colors.push(color.r, color.g, color.b)
                }


            }

            return [positions, times, speeds, sizes, colors]
        }

        _getProject(a: THREE.Vector3, projectOnWhich: THREE.Vector3) {
            let aOnWhich = a.clone().projectOnVector(projectOnWhich);
            return aOnWhich;
        }


        /**
         *  计算下一时刻的速度、位置
         *
         * @param {*} v 当前速度
         * @param {*} p 当前位置
         * @param {*} a 加速度
         * @param {*} Epsilon 时间步长
         * @returns 下一时刻的位置
         * @memberof WaterGun
         */
        _calculateNextState(v: THREE.Vector3, p: THREE.Vector3, a: THREE.Vector3, Epsilon: number) {
            let nextV = v.clone().add(a.clone().multiplyScalar(Epsilon));
            let nextP = p.clone().add(v.clone().multiplyScalar(Epsilon));
            return [nextV, nextP];
        }
        _howLongWillItTakeToReachTheGround(v: THREE.Vector3, p: THREE.Vector3, a: THREE.Vector3, ground: THREE.Plane) {
            let v_1 = v.clone().projectOnVector(ground.normal).manhattanLength()
            let a_1 = a.clone().projectOnVector(ground.normal).manhattanLength()
            let distance = ground.distanceToPoint(p)
            let t1 = (-v_1 + Math.sqrt(v_1 * v_1 + 2 * a_1 * distance)) / a_1
            let t2 = (-v_1 - Math.sqrt(v_1 * v_1 + 2 * a_1 * distance)) / a_1

            let t11 = Math.max(0, t1)
            let t22 = Math.max(0, t2)
            let t = Math.min(t11, t22) == 0 ? Math.max(t11, t22) : Math.min(t11, t22)
            return t;
        }


        init() {

            this.particlesGeometry = new THREE.BufferGeometry()

            let positions: any[] = [] // 每个点由三个坐标值组成（x, y, z）
            let speeds: any[] = []; // 每个点由三个坐标值组成（x, y, z）
            let times: any[] = [];

            let colors: any[] = [];
            let sizes: any[] = [];
            let a = this.params.a;

            for (let i = 0; i < this.params.p.length; i++) {
                let v0 = this.params.v[i];
                let p0 = this.params.p[i];
                let t = this._howLongWillItTakeToReachTheGround(v0, p0, a, this.params.ground);
                // 一共几组
                let n = Math.floor(t / this.params.Epsilon);
                this.perWaterPipeGroupCount = n;
                let [_p, _t, _v, _s, _c] = this._createOneWaterPipe(p0, v0, n, this.params.Epsilon, this.params.shake_position, this.params.shake_speed, this.params.shake_time)

                positions = positions.concat(_p);
                speeds = speeds.concat(_v);
                times = times.concat(_t);
                sizes = sizes.concat(_s);
                colors = colors.concat(_c);
            }
            

            this.particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            this.particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            this.particlesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

            let p_0 = JSON.parse(JSON.stringify(positions));
            this.particlesGeometry.setAttribute('position_0', new THREE.Float32BufferAttribute(p_0, 3));
            this.particlesGeometry.setAttribute('V_0', new THREE.Float32BufferAttribute(speeds, 3));
            let v_current = JSON.parse(JSON.stringify(speeds));
            this.particlesGeometry.setAttribute('V_N', new THREE.Float32BufferAttribute(v_current, 3));
            this.particlesGeometry.setAttribute('T', new THREE.Float32BufferAttribute(times, 1).setUsage(THREE.DynamicDrawUsage));

            this.T = [0, this.params.Epsilon]
        }

        // 一次更新一个时间段
        _updateParticlesGeometry() {
            let positions: any = this.particlesGeometry.attributes.position.array;
            let positions_origin: any = this.particlesGeometry.attributes.position_0.array;
            let speeds: any = this.particlesGeometry.attributes.V_N.array;
            let speeds_origin: any = this.particlesGeometry.attributes.V_0.array;

            let times: any = this.particlesGeometry.attributes.T.array;
            
            for (let i = 0; i < positions.length;) {
                // let mod = this.T % this.perWaterPipeGroupCount
                // 每次回原点一个组
                if(this.T[0] <= times[i] && times[i] <= this.T[1]) {
                    positions[i * 3] = positions_origin[i * 3];
                    positions[i * 3 + 1] = positions_origin[i * 3 + 1];
                    positions[i * 3 + 2] = positions_origin[i * 3 + 2];
                    
                    speeds[i * 3] = speeds_origin[i * 3];
                    speeds[i * 3 + 1] = speeds_origin[i * 3 + 1];
                    speeds[i * 3 + 2] = speeds_origin[i * 3 + 2];
                }else{// 返回原点
                    let [next_v, next_P] = this._calculateNextState(new THREE.Vector3(speeds[i * 3], speeds[i * 3 + 1], speeds[i * 3 + 2]), new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]), this.params.a, this.params.Epsilon)
                    positions[i * 3] = next_P.x;
                    positions[i * 3 + 1] = next_P.y;
                    positions[i * 3 + 2] = next_P.z;
                    
                    speeds[i * 3] = next_v.x;
                    speeds[i * 3 + 1] = next_v.y;
                    speeds[i * 3 + 2] = next_v.z;                                                            
                }
                i+=3;                
            }

        }

        render() {

            this.T[0] += this.params.Epsilon;
            this.T[1] += this.params.Epsilon;

            if(this.T[1] > this.params.Epsilon * this.perWaterPipeGroupCount) {
                this.T = [0, this.params.Epsilon];
            }            
            this._updateParticlesGeometry()

            // let n = this.perWaterPipeGroupCount * this.params.countPerGroup
            // for (let i = 0; i < this.params.p.length; i++) {
            //     const startIndex = i * n;
            //     // const endIndex = startIndex + n * 3;
            //     this._updateParticlesGeometry(startIndex, n, this.T)
            // }

            this.particlesGeometry.attributes.position.needsUpdate = true;

        }

    }
}