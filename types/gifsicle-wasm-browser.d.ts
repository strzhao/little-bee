// 声明 gifsicle-wasm-browser 模块类型
declare module 'gifsicle-wasm-browser' {
    interface GifsicleInput {
        file: Uint8Array | string | File | Blob | ArrayBuffer;
        name: string;
    }
    
    interface GifsicleOptions {
        input: GifsicleInput[];
        command: string[];
    }
    
    interface Gifsicle {
        run(options: GifsicleOptions): Promise<File[]>;
    }
    
    const gifsicle: Gifsicle;
    export default gifsicle;
}