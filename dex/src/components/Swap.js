import React, { useState, useEffect } from 'react';
import { Input, Popover, Radio, Modal, message } from "antd";
import { ArrowDownOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";

function Swap() {
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null)
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null)
  const [tokenOne, setTokenOne] = useState(tokenList[0])
  const [tokenTwo, setTokenTwo] = useState(tokenList[1])
  const [isOpen, setIsOpen] = useState(false)
  const [changeToken, setChangeToken] = useState(1)
  const [usdPrices, setUsdPrices] = useState(null)


  const handleSlipPageChange = (e) => {
    setSlippage(e.target.value);
  }

  const changeAmount = (e) => {
    setTokenOneAmount(e.target.value)
    if (e.target.value && usdPrices) {
      setTokenTwoAmount((e.target.value * usdPrices.ratio).toFixed(5))
    } else {
      setTokenTwoAmount(null)
    }
  }

  const switchTokens = () => {
    setUsdPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);

    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);

    fetchPrices(one.address, two.address)
  }

  const openModal = (val) => {
    setChangeToken(val);
    setIsOpen(true);
  }

  const modifyToken = (val) => {
    setUsdPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);

    if (changeToken === 1) {
      setTokenOne(tokenList[val]);
      fetchPrices(tokenList[val].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[val]);
      fetchPrices(tokenOne.address, tokenList[val].address)
    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {
    const response = await axios.get("http://localhost:3001/tokenPrice", {
      params: {
        addressOne: one, addressTwo: two,
      }
    })
    const res = await response.data;
    setUsdPrices(res);
  }

  useEffect(() => {
    fetchPrices(tokenOne.address, tokenTwo.address);
  }, [tokenOne, tokenTwo])

  const settings = (<>
    <div>Slippage Tolerance</div>
    <div>
      <Radio.Group value={slippage} onChange={handleSlipPageChange}></Radio.Group>
      <Radio.Button value={0.5}>0.5%</Radio.Button>
      <Radio.Button value={2.5}>2.5%</Radio.Button>
      <Radio.Button value={5}>5.0%</Radio.Button>
    </div>
  </>
  )


  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {
            tokenList?.map((e, i) => (
              <div className="tokenChoice" key={i} onClick={() => modifyToken(i)}>
                <img src={e.img} alt={e.ticker} className='tokenLogo' />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            ))
          }
        </div>
      </Modal>

      <div className='tradeBox'>
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement='bottomRight'
          >
            <SettingOutlined className='cog' />
          </Popover>
        </div>
        <div className="inputs">
          <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} />
          <Input placeholder='0' value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className='switchArrow' />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className='assetLogo' />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetTwoLogo" className='assetLogo' />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount}>Swap</div>
      </div>
    </>
  )
}

export default Swap