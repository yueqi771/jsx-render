interface entityMapData {
    [key: string]: string;
}
export declare const entityMap: entityMapData;
export declare const escapeHtml: (str: object[] | string) => string;
export declare const AttributeMapper: (val: string) => string;
export declare function DOMcreateElement(tag: Function | string, attrs?: {
    [key: string]: any;
}, ...children: (HTMLElement | string)[]): HTMLElement;
export declare const DOMcreateFragment: (attrs?: {
    [key: string]: any;
} | undefined, ...children: (HTMLElement | string)[]) => (HTMLElement | string)[];
export {};
