export default class Ray {
    constructor(ori, dir) {
        this.origin = ori;
        this.direction = dir;
    }

    duplicate() {
        return new Ray(this.origin, this.direction);
    }
}
