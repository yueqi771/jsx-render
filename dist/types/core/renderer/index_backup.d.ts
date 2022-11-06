import { FunctionJSXElement, JSXElement } from "@root/src/types/react-app";
declare class Renderer {
    ast: any;
    mountFunctionComponent(ast: FunctionJSXElement): any;
    mount(ast: JSXElement, container: HTMLElement): void;
    render(ast: any, container: HTMLElement): void;
    reconcileChildren(children: Array<JSXElement>, parentElement: HTMLElement): void;
    createDOM(ast: JSXElement | string): any;
}
declare let renderer: Renderer;
/**
 * 生命周期
 */
export declare function useState(initialState: any): any[];
export default renderer;
