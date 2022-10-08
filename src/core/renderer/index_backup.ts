import { CompositeObject, FunctionJSXElement, JSXElement } from "@root/src/types/react-app";


let scheduleUpdate: any;
let hookIndex = 0;
let hookStates: any[] = []; // 存放状态的数组
let scheduleUpdated = false
class Renderer {
  ast: any = {}
  mountFunctionComponent(ast: FunctionJSXElement) {

    let { type: FunctionComponent, props } = ast;

    let renderVitrualDOM = FunctionComponent(props);
    
    if(!renderVitrualDOM) {
      return
    }
    
    ast = { ...ast, alternate: renderVitrualDOM }

    console.log('ast2222233333', ast)

    return this.createDOM(renderVitrualDOM)
  }

  mount(ast: JSXElement, container: HTMLElement) {
    debugger
    let ele = this.createDOM(ast)

    container.appendChild(ele)
  }


  render(ast: any, container: HTMLElement) {


    transformAst(ast, this.ast)

    this.mount(this.ast, container)

    console.log('this.ast111---', this.ast)
    scheduleUpdate = () => {
      if(!scheduleUpdated) {
        scheduleUpdated = true

        queueMicrotask(() => {
          scheduleUpdated = false;

          hookIndex = 0;
          debugger
          compareVirtualDOM(container, ast.alternate, ast)
        })
      }
    }
  }

  reconcileChildren(children: Array<JSXElement>, parentElement: HTMLElement) {
    if(!children || children.length <= 0) {
      return 
    }
    for(let index = 0; index < children.length; index ++) {

      if(!children[index]) {
        continue
      }
      this.mount(children[index], parentElement)
    }
  }

  createDOM(ast: JSXElement | string): any {
    
    if(typeof ast === 'string') {
      return document.createTextNode(ast)
    }
    let { type, props, ref } = ast;
  
    let dom;
    
    if(typeof type === 'function') {
      // @ts-ignore
      dom = this.mountFunctionComponent(ast)
    }else {
      dom = document.createElement(type)
    }
  
    // 更新props
    if(props) {
      updateProps(dom, {}, props)
      let children = Array.isArray(props.children) ? props.children : [props.children]

      
      this.reconcileChildren(children, dom)
    }
    

   ast = { ...ast , $el: dom};

    return dom
  }
}

let renderer = new Renderer()


function compareVirtualDOM(container: HTMLElement, oldVirtualDOM?: JSXElement, newVitrualDOM?: JSXElement, nextDom?: HTMLElement) {
  if(!oldVirtualDOM && !newVitrualDOM) {
    return
  }else if(oldVirtualDOM && !newVitrualDOM) {
    unMountVitualDOM(oldVirtualDOM)
  }else if(!oldVirtualDOM && newVitrualDOM) {
    let newDOM = renderer.createDOM(newVitrualDOM)

    // 这里需要处理一下插入的逻辑
    container.appendChild(newDOM)
  
  // 老得虚拟DOM存在，新的虚拟DOM也存在，并且类型相同，是一个函数组件或者是同一个类组件
  }else if(oldVirtualDOM && newVitrualDOM && typeof oldVirtualDOM.type !== typeof newVitrualDOM.type) {
    unMountVitualDOM(oldVirtualDOM);

    let newDom = renderer.createDOM(newVitrualDOM);

    container.appendChild(newDom)
  } else {
    // DOM diff过程

  }


}

function ElementDiff(oldVirtulaDOM: JSXElement, newVitrualDOM: JSXElement) {
  if(typeof oldVirtulaDOM) {}
}

function unMountVitualDOM(virtualDOM: JSXElement) {
  const { type, props, ref } = virtualDOM;

  const currentDOM = findDOM(virtualDOM)

  // 执行卸载的生命周期

  if(props.children) {
    props.children.forEach(unMountVitualDOM)
  }

  if(currentDOM) {
    currentDOM.remove()
  }
}


function findDOM(vdom: JSXElement): any {
  if(!vdom) {
    return null
  } 

  if(vdom.$el) {
    return vdom.$el
  }else {
    let renderVdom = vdom.alternate

    return findDOM(renderVdom!)
  }
}

function updateProps(element: any, oldProps: CompositeObject, newProps: CompositeObject) {
  for(let key in newProps) {
    if(key === 'children') {
      continue
    }else if(key === 'style') {
      let styleObj = newProps[key];
      for(let attr in styleObj) {
        (element as any).style[attr] = styleObj[attr]
      }
    }else if(/^on[A-Z].*/.test(key)) {
      // 处理事件逻辑
    }else {
      element[key] = newProps[key]
    }
  }
}


/**
 * 生命周期
 */
export function useState(initialState: any) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;

  const currentIndex = hookIndex;


  function setState(newState: any) {
    hookStates[currentIndex] = newState;
    // 开始更新
    scheduleUpdate()
  }

  return [hookStates[hookIndex++], setState]

}

function useEffect() {

}

function transformAst(ast: any, targetAst: any) {
  let keys = ['key', 'ref', 'type', ]


  Object.keys(ast).forEach(key => {
    if(keys.includes(key)) {
      targetAst[key] = ast[key]
     
    }

    if(key === "props") {
      targetAst.props = targetAst.props || {}
        for(let i in ast['props']) {
          if(i !== 'children') {
            targetAst['props'][i] = ast['props'][i]
          }else {
            let children = ast['props']['children']
            let targetChildren = targetAst['props'].children = []

            if(children && children.length > 0) {
              children.forEach((child: any) => {
                transformAst(wrapToAst(child), targetAst['props']['children'])
              });
            }
          }
        }
    }
  })
}

function wrapToAst(element: any) {
  return typeof element === 'string' || typeof element === 'number' ? 
  {
    type: 'text', 
    props: { text: element }
  } 
  : 
  element
}

export default renderer