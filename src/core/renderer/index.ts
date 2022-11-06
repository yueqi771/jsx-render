import { CompositeObject, JSXElement, RenderAst, RenderTagType } from '@root/src/types/react-app';
import { FunctionComponentAst } from '../../types/react-app';

let scheduleUpdate: any;
let hookIndex = 0;
let hookStates: any[] = []; // 存放状态的数组
let scheduleUpdated = false

class Renderer {
  private _alternateMap: Map<number, RenderAst> = new Map()

  private _id: number = -1

  private _ast: RenderAst = {
    tag: '',
    type: RenderTagType.NativeTag,
    props: {}
  }

  get alternateMap() {
    return this._alternateMap
  }

  public render(ast: JSXElement, container: HTMLElement) {
    this._ast = transformAst(ast);
    // 执行挂载函数，

    this.mount(this._ast, container)

    // 添加更新函数
    scheduleUpdate = () => {
      if(!scheduleUpdated) {
        scheduleUpdated = true

        queueMicrotask(() => {
          scheduleUpdated = false;

          hookIndex = 0;

          compareVirtualDOM(container, this._ast, this._ast)
        })
      }
    }
  }

  public mount(ast: RenderAst, container: HTMLElement) {
    let element = this.createElementDOM(ast)!

    container.appendChild(element)
  }

  public createElementDOM(ast: RenderAst) {
    let { type, props } = ast;

    let dom;
    
    if(type === RenderTagType.Text) {
      dom = document.createTextNode(ast.props.text.text)

      ast.props.text.el = dom
      ast.$el = ast.props.text.el

    }else if(type === RenderTagType.FuntionComponent) {
      dom = this.mountFunctionComponent((ast as FunctionComponentAst))
      ast.$el = dom;

    }else {
      dom = document.createElement((ast.tag as string))
      ast.$el = dom;

    }


    if(props) {
      updateProps(dom, {}, props)

      if(props.children) {
        let children = Array.isArray(props.children) ? props.children : [props.children]

        props.children = children = children.map(item => transformAst(item))

        const res = this.reconcileChildren(children, (dom as HTMLElement))

        console.log('reconcileChildren', res)
      }
      
    }


    return dom
  }

  public mountFunctionComponent(ast: FunctionComponentAst): HTMLElement | Text |undefined{

    let { tag: FunctionComponent, props } = ast;

    let renderVitrualDOM = transformAst(FunctionComponent(props));
    
    if(!renderVitrualDOM) {
      return document.createTextNode('')
    }

    this._alternateMap.set(this._id+1, renderVitrualDOM)
    ast.id = this._id+1
    ast.alternate = renderVitrualDOM

    
    return this.createElementDOM(renderVitrualDOM)
  }

  public reconcileChildren(children: Array<any>, parentElement: HTMLElement) {

    for(let index = 0; index < children.length; index ++) {

      if(!children[index]) {
        continue
      }

      this.mount(children[index], parentElement)
    }

    return children
  }
}


class TextNode {
  public el?: Text;
  public text: string = ''

  constructor(text: string, dom?: Text) {
    this.text = text
    this.el = dom
  }

}

const renderer = new Renderer()


function transformAst(vitrualDOM: JSXElement | any): RenderAst {
  let renderAst: RenderAst = {
    tag: '',
    type: RenderTagType.NativeTag,
    props: {}
  };

  if(typeof vitrualDOM === 'string') {
    renderAst =  {
      tag: 'text',
      type: RenderTagType.Text,
      props: { 
        text: new TextNode(vitrualDOM) 
      }
    }
  }else if(vitrualDOM.tag === 'text') {
    return vitrualDOM

  }else {
    let tagType = typeof vitrualDOM.type;

    switch(tagType) {
      case 'string':
        renderAst.tag = vitrualDOM.type;
        renderAst.type = RenderTagType.NativeTag;
        break;
      case 'function': 
        renderAst.tag = vitrualDOM.type;
        renderAst.type = RenderTagType.FuntionComponent;
        break;
    }

    renderAst.props = { ...vitrualDOM.props }
  }

  return renderAst

}

function updateProps(element: any, oldProps: CompositeObject, newProps: CompositeObject) {
  for(let key in newProps) {
    if(key === 'children' || key === 'text') {
      continue
    }else if(key === 'style') {
      let styleObj = newProps[key];
      for(let attr in styleObj) {
        element.style[attr] = styleObj[attr]
      }
    }else if(/^on[A-Z].*/.test(key)) {
      // 处理事件逻辑
    }else {
      element[key] = newProps[key]
    }
  }
}

function compareVirtualDOM(container: HTMLElement, oldVirtualDOM?: RenderAst, newVitrualDOM?: RenderAst, nextDom?: HTMLElement) {
  if(!oldVirtualDOM && !newVitrualDOM) {
    return
  }else if(oldVirtualDOM && !newVitrualDOM) {
    unMountVitualDOM(oldVirtualDOM)
  }else if(!oldVirtualDOM && newVitrualDOM) {
    let newDOM = renderer.createElementDOM(newVitrualDOM)!

    // 这里需要处理一下插入的逻辑
    container.appendChild(newDOM)
  
  // 老得虚拟DOM存在，新的虚拟DOM也存在，并且类型相同，是一个函数组件或者是同一个类组件
  }else if(oldVirtualDOM && newVitrualDOM && typeof oldVirtualDOM.type !== typeof newVitrualDOM.type) {
    unMountVitualDOM(oldVirtualDOM);

    let newDom = renderer.createElementDOM(newVitrualDOM)!;

    container.appendChild(newDom)
  } else {
    // DOM diff过程
    updateElement(oldVirtualDOM!, newVitrualDOM!)
  }
}

function updateElement(oldVdom: RenderAst, newVdom: RenderAst) {
  if(oldVdom.type === RenderTagType.FuntionComponent) {
    updateFunctionComponent((oldVdom as FunctionComponentAst), (newVdom as FunctionComponentAst))
  }else if(oldVdom.type === RenderTagType.Text) {
    let currentDOM = newVdom.$el = findDOM(oldVdom);
     
    if (oldVdom.props.text !== newVdom.props.text) {
      currentDOM.textContent = newVdom.props.text.text;
    }
  }else if(oldVdom.type === RenderTagType.NativeTag){
    let currentDOM = newVdom.$el = findDOM(oldVdom);

    updateProps(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  }
}

function updateFunctionComponent(oldVdom: FunctionComponentAst, newVdom: FunctionComponentAst) {
  let currentDOM = findDOM(oldVdom);
  if (!currentDOM) return;
  let parentDOM = currentDOM.parentNode;
  const { tag, props } = newVdom;
  let newRenderVdom = transformAst(tag(props)) ;

  compareVirtualDOM(parentDOM, oldVdom.alternate, newRenderVdom)
  newRenderVdom.alternate = newRenderVdom
}

function unMountVitualDOM(virtualDOM: RenderAst) {
  const { type, props } = virtualDOM;

  const currentDOM = findDOM(virtualDOM)

  // 执行卸载的生命周期

  if(props.children) {
    props.children.forEach(unMountVitualDOM)
  }

  if(currentDOM) {
    currentDOM.remove()
  }
}

function findDOM(vdom: RenderAst): any {
  if(!vdom) {
    return null
  } 

  if(vdom.$el) {
    return vdom.$el
  }else if(vdom.type === RenderTagType.Text) {
    return vdom.props.test.el
  }
  else {
    let renderVdom = vdom.alternate

    return findDOM(renderVdom!)
  }
}

function updateChildren(parentDOM: HTMLElement, oldVirtualChild: any[], newVirtualChild: any[]) {
  let oldVirtualChildren = ((Array.isArray(oldVirtualChild) ? oldVirtualChild : [oldVirtualChild])).filter(Boolean);
  let newVirtualChildren = (Array.isArray(newVirtualChild) ? newVirtualChild : [newVirtualChild]).filter(Boolean);
  let lastPlacedIndex = -1;//上一次不需要移动的老节点的挂载索引
  let keyedOldMap: CompositeObject = {};

  oldVirtualChildren.forEach((child, index) => {
    let childAst = transformAst(child)

    child = {...childAst, mountIndex: index}

    let oldKey = child && child.key ? child.key : index
    keyedOldMap[oldKey] = child;
  })

  let patch: any[] = []

  newVirtualChildren.forEach((child, index) => {
    let childAst = transformAst(child)
    
    child = {...childAst, mountIndex: index}
    

    let newKey = childAst.key ? childAst.key : index;

    let oldChild = keyedOldMap[newKey]

    if(oldChild) {
      updateElement(oldChild, childAst)

      if(oldChild.mountIndex < lastPlacedIndex) {
        patch.push({
          type: 'MOVE',
          oldChild,
          newChild: childAst,
          mountIndex: index
        })
      }

      delete keyedOldMap[newKey]

      lastPlacedIndex = Math.max(lastPlacedIndex, oldChild.mountIndex)
    }else {
      patch.push({
        type: 'PLACEMENT',
        child,
        mountIndex: index
      })
    }

  })

  let moveChild = patch.filter(action => action.type === 'MOVE').map(action => action.oldChild);

  Object.values(keyedOldMap).concat(moveChild).forEach(child => {
    let currentDOM = findDOM(child);

    currentDOM.remove()
  })

  patch.forEach(action => {
    let { type, oldChild, newChild, mountIndex } = action

    let childNodes = parentDOM.childNodes;

    if(type === 'PLACEMENT') {
      let newDOM = renderer.createElementDOM(newChild);
      let childNode = childNodes[mountIndex];
      if(childNode) {
        parentDOM.insertBefore(newDOM!, childNode)
      }else {
        parentDOM.appendChild(newDOM!)
      }
      

    }else if(type === 'MOVE') {
      let oldDOM = findDOM(oldChild)

      let childNode = childNodes[mountIndex];

      if (childNode) {
        parentDOM.insertBefore(oldDOM, childNode)
      } else {
        parentDOM.appendChild(oldDOM);
      }
    } 
  })
}

/**
 * 生命周期
 */
 export function useState(initialState: any) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;

  const currentIndex = hookIndex;


  function setState(newState: any) {
    if(hookStates[currentIndex] !== newState) {
      hookStates[currentIndex] = newState;
    }
    // 开始更新
    scheduleUpdate()
  }

  return [hookStates[hookIndex++], setState]

}



export default renderer