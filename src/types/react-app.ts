
  // let { type, props, ref } = vdom;

export interface JSXElement {
  type: string | Function
  props: CompositeObject
  ref: HTMLElement
  mountIndex?: number
  $el?: HTMLElement
  alternate?: JSXElement
  key?: any

}

export interface FunctionJSXElement extends JSXElement {
  type: Function
}

export interface CompositeObject {
  [key: string]: any
}

export interface RenderAst {
  $el?: any
  tag: Function | string;
  type: RenderTagType,
  props: CompositeObject,
  alternate?: RenderAst
  ref?: HTMLElement
  id? : number
  key?: any
  mountIndex?: number
}

export interface FunctionComponentAst extends RenderAst{
  tag: Function
}

export enum RenderTagType {
  FuntionComponent = "FUNCIONTCOMPONENT",
  Text = "TEXT",
  NativeTag = "NATIVETAG"
}