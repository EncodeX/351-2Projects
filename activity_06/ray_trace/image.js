export default class Image {
    constructor() {
        this.height = 256;
        this.width = 256;
        this.pixSize = 3;
        this.intBuffer = new Uint8Array(this.height * this.width * this.pixSize);
        this.floatBuffer = new Float32Array(this.height * this.width * this.pixSize);

        for (let j = 0; j < this.height; j++) { // for the j-th row of pixels
            for (let i = 0; i < this.width; i++) { // and the i-th pixel on that row,
                var idx = (j * this.width + i) * 3; // pixel (i,j) array index (red)
                // if ((i % 26) * (j % 26) == 0) {
                //     this.intBuffer[idx] = 0; // 0 <= red <= 255
                //     this.intBuffer[idx + 1] = 0; // 0 <= grn <= 255
                //     this.intBuffer[idx + 2] = 0; // 0 <= blu <= 255
                // } else {
                //     this.intBuffer[idx] = 255; // 0 <= red <= 255
                //     this.intBuffer[idx + 1] = 255; // 0 <= grn <= 255
                //     this.intBuffer[idx + 2] = 255; // 0 <= blu <= 255
                // }
                this.intBuffer[idx] = 255; // 0 <= red <= 255
                this.intBuffer[idx + 1] = 255; // 0 <= grn <= 255
                this.intBuffer[idx + 2] = 255; // 0 <= blu <= 255
            }
        }
        this.int2Float();
    }

    float2Int() {
        // float 2 int
        this.intBuffer.map((_, i) => {
            let value = Math.min(1.0, Math.max(0.0, this.floatBuffer[i]));
            this.intBuffer[i] = Math.min(255.0, Math.floor(value * 256.0));
        });
    }

    int2Float() {
        // int 2 float
        this.floatBuffer.map((_, i) => {
            this.floatBuffer[i] = this.intBuffer[i] / 255.0;
        });
    }

    setFLoatColor(pos, color) {
        let s = (pos[1] * this.width + pos[0]) * this.pixSize;
        this.floatBuffer[s] = color[0];
        this.floatBuffer[s + 1] = color[1];
        this.floatBuffer[s + 2] = color[2];
    }

    setIntColor(pos, color) {
        let s = (pos[1] * this.width + pos[0]) * this.pixSize;
        this.intBuffer[s] = color[0];
        this.intBuffer[s + 1] = color[1];
        this.intBuffer[s + 2] = color[2];
    }
}
