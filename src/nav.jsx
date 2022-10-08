import { useState } from "./core/renderer/index"


function Nav(props = {}) {
  const [text, setText] = useState('text数据')

  setTimeout(() => {
    console.log('更新页面')
    setText('更新后的text数据')
  }, 2000)

  return (
    <div className="nav-dev">
      <p>这里是nav导航 </p>
      <p>props的数据： {props.name}</p>
      <p>state的数据：{ text }</p>
      <Title />
    </div>
  )
}

function Title() {
  return (
    <h1>
      这里是title
    </h1>
  )
}

export default Nav