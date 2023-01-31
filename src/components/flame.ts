import * as THREE from 'three'


export namespace Flame {
    export interface FlameParams {
        position: THREE.Vector3[];
        height: number;
        perflameParticlesCount: number;
        p_energyTransfer: number; // 能量保留概率
        p_energyDecrease: number; // 能量若不保留的衰减系数
        count_engergy_remain_perTransfer: number; // 能量保留计数器(就是一旦衰减了之后多久不衰减)
        step: {
            x: number,// [0,1]
            p: number,// [0,1] 概率
            size: number,
            color: THREE.Color,           
        }[];
        shake?: boolean; // 是否抖动 暂未使用
        shakeRadtio?: number; // 抖动系数 暂未使用
    }

    const defaultParams: FlameParams = {
        height: 1,
        position: [new THREE.Vector3(0, 0, 0)],
        perflameParticlesCount: 50,

        // 3 基于概率的能量传递
        count_engergy_remain_perTransfer: 10,
        p_energyTransfer: 0.9,
        p_energyDecrease: 0.75,
        step: [
            { x: 1, p: 0.3, size: 0.1, color: new THREE.Color('#FFC400')},
            { x: 0.8, p: 0.5, size: 0.3, color: new THREE.Color('#FF3D00')},
            { x: 0.4, p: 0.1, size: 0.01, color: new THREE.Color('#2962FF')},
            { x: 0.1, p: 0.1, size: 0, color: new THREE.Color('#000000')},
        ],
        

        // 2 基于概率的粒子分布
        // step: [
        //     { x: 0.2, p: 0.3, size: 0.1, color: new THREE.Color('#FFC400')},
        //     { x: 0.8, p: 0.5, size: 0.3, color: new THREE.Color('#FF3D00')},
        //     { x: 1, p: 0.1, size: 0.01, color: new THREE.Color('#BDBDBD')},
        // ],

        //1 均分粒子
        // sizeStep: [{ size: 0.1, percent: 0 }, { size: .1, percent: 0.6 }, { size: 0.01, percent: 1 }],
        // colorStep: [{ color: new THREE.Color('#FFC400'), percent: 0 }, { color: new THREE.Color('#FF3D00'), percent: 0.6 }, { color: new THREE.Color('#BDBDBD'), percent: 1 }],
    };

    export class FlameGeom {
        params: FlameParams = defaultParams
        particlesGeometry!: THREE.BufferGeometry;

        constructor(params?: FlameParams) {
            if (params) {
                this.params = Object.assign(this.params, params);
            }
            this.params.step.sort((a, b) => a.x - b.x);
            // 概率归一化
            let sum_p = this.params.step.reduce((a, b) => a + b.p, 0);
            this.params.step.forEach((item) => {
                item.p = item.p / sum_p;
            });

            // 2 基于概率的粒子分布
            // this.params.colorStep.sort((a, b) => a.percent - b.percent);
            // this.params.sizeStep.sort((a, b) => a.percent - b.percent);

        }
        init() {


            this.particlesGeometry = new THREE.BufferGeometry()

            let positions: any[] = [] // 每个点由三个坐标值组成（x, y, z）
            let colors: any[] = [];
            let sizes: any[] = [];

            for (let i = 0; i < this.params.position.length; i++) {
                const oneFlameOriginPosition = this.params.position[i];
                // 每个起火点生成一堆粒子
                let [_p, _c, _s] = this._createOneFlame(oneFlameOriginPosition);
                positions = positions.concat(_p);
                colors = colors.concat(_c);
                sizes = sizes.concat(_s);
            }

            this.particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            this.particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            this.particlesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
        }

        _getStep(list: any[], percent: number, attributeField: string = 'percent') {

            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (item[attributeField] > percent) {
                    return item;
                }
            }
            return list[list.length - 1];
        }

        _createOneFlame(position: THREE.Vector3) {
            const perStepHeoght = this.params.height / this.params.perflameParticlesCount;

            const positions: any[] = [] // 每个点由三个坐标值组成（x, y, z）
            const colors: any[] = [];
            const sizes: any[] = [];
            // const energes: any[] = [];

            // 3 基于概率的能量传递 根据能量等级匹配粒子颜色和大小
            let currentEngery = 1;                        
            let count_engergy_remain_perTransfer = this.params.count_engergy_remain_perTransfer;
            for (let i = 0; i < this.params.perflameParticlesCount; i += 1) {
                // 能量是否传递(TODO: 增加概率随机衰减)
                let isRemain = (Math.random() > this.params.p_energyTransfer)                
                if(count_engergy_remain_perTransfer > 0){
                    count_engergy_remain_perTransfer -= 1;
                    isRemain = true;
                }

                if(!isRemain){
                    count_engergy_remain_perTransfer = this.params.count_engergy_remain_perTransfer;
                }

                currentEngery = currentEngery * (isRemain ? 1 : this.params.p_energyDecrease);
                const percent = currentEngery;

                const x = position.x
                const y = position.y + i * perStepHeoght
                const z = position.z
                positions.push(x, y, z)

                let stepDefine = this._getStep(this.params.step, percent, 'x');
                let c = stepDefine.color;
                colors.push(c.r, c.g, c.b);

                let s = stepDefine.size;
                sizes.push(s);
           
            }



           // 2 基于概率的粒子分布

            // let start = 0;
            // let end = 0;

            // for (let i = 0; i < this.params.step.length; i++) {
            //     const stepDefine = this.params.step[i];
            //     const stepCount = Math.floor(stepDefine.p * this.params.perflameParticlesCount);
            //     if(stepDefine.x > end){
            //         end = stepDefine.x;
            //     }

            //     const startPositionY = position.y + start * this.params.height;
            //     const endPositionY = position.y + end * this.params.height;
            //     // let c = this._getStep(this.params.step.map(x=>x.color), stepDefine.x).color;
            //     // let s = this._getStep(this.params.step.map(x=>x.size), stepDefine.x).size;
            //     let c = stepDefine.color;
            //     let s = stepDefine.size;

            //     for (let j = 0; j < stepCount; j++) {
            //         const x = position.x
            //         const y = startPositionY + (endPositionY - startPositionY) * Math.random()
            //         const z = position.z
            //         positions.push(x, y, z)
            //         colors.push(c.r, c.g, c.b);
            //         sizes.push(s);
            //     }



            //     start = end;

            // }


            // 1 均分粒子
            // for (let i = 0; i < this.params.perflameParticlesCount; i += 1) {
            //     const percent = i / this.params.perflameParticlesCount;

            //     const x = position.x
            //     const y = position.y + i * perStepHeoght
            //     const z = position.z 
            //     positions.push(x, y, z)

            //     let c = this._getStep(this.params.colorStep, percent).color;
            //     colors.push(c.r, c.g, c.b);

            //     let s = this._getStep(this.params.sizeStep, percent).size;
            //     sizes.push(s);

            // }            
            return [positions, colors, sizes]

        }


        _randomShake(seed, range) {
            const time = Date.now() * 0.005 + seed;
            // particleSystem.rotation.z = 0.01 * time;

            let positions: any = this.particlesGeometry.attributes.position.array;
            const sizes: any = this.particlesGeometry.attributes.size.array;
            for (let i = range[0]; i < range[1]; i++) {
                // sizes[i] +=  Math.cos(0.1 * i + time)* 0.02;
                if (sizes[i] < 0.3) {
                    sizes[i] += (Math.random() - 0.5) * 0.05;
                } else {
                    sizes[i] -= (Math.random()) * 0.05;
                }

                // positions[i * 3] += Math.sin(0.1 * i + time) * 0.001;
                positions[i * 2] += Math.sin(0.1 * i + time) * 0.002;
                // positions[i * 1] += Math.sin(0.1 * i + time) * 0.001;
                
                // positions[i * 2] += Math.sin(0.1 * i + time) * 0.002;
            }
        }
        render() {
            for (let i = 0; i < this.params.position.length; i++) {
                const start = i * this.params.perflameParticlesCount * 3;
                const end = start + this.params.perflameParticlesCount * 3;
                // 扩散问题是seed不是固定数字, 而是随机的,造成了粒子的位置变化不是周期的,可以后续对每个火点记录一个固定seed
                this._randomShake(Math.random() * 10, [start, end]);
            }
            this.particlesGeometry.attributes.size.needsUpdate = true;
            this.particlesGeometry.attributes.position.needsUpdate = true;
            this.particlesGeometry.attributes.color.needsUpdate = true;
        }
    }
}
