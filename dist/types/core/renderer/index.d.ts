import { JSXElement, RenderAst } from '@root/src/types/react-app';
import { FunctionComponentAst } from '../../types/react-app';
declare class Renderer {
    private _alternateMap;
    private _id;
    private _ast;
    get alternateMap(): Map<number, RenderAst>;
    render(ast: JSXElement, container: HTMLElement): void;
    mount(ast: RenderAst, container: HTMLElement): void;
    createElementDOM(ast: RenderAst): HTMLElement | Text | undefined;
    mountFunctionComponent(ast: FunctionComponentAst): HTMLElement | Text | undefined;
    reconcileChildren(children: Array<any>, parentElement: HTMLElement): any[];
}
declare const renderer: Renderer;
/**
 * 生命周期
 */
export declare function useState(initialState: any): any[];
export default renderer;
