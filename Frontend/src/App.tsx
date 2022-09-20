import React, { useState } from 'react'
import logo from './logo.svg'
import axios from 'axios'
import './App.css'
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react'

// 1. import `ChakraProvider` component
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {
  const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || ""
  const [address, setAddress] = useState('')
  const [startBlock, setStartBlock] = useState(0)
  const [endBlock, setEndBlock] = useState(99999999)
  const handleChangeAddress = (e: any) => {
    const inputValue = e.target.value
    setAddress(inputValue)
  }
  const handleChangeStartBlock = (e: any) => {
    const inputValue = e.target.value
    setStartBlock(inputValue)
  }
  const handleChangeEndBlock = (e: any) => {
    const inputValue = e.target.value
    setEndBlock(inputValue)
  }

  const main = async () => {
    const formedData: any[] = []
    await axios
      .get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}page=1&offset=10&sort=asc&apikey=${ETHERSCAN_API_KEY}`,
      )
      .then((res: any) => {
        let array = res.data.result
        console.log(array, 'array')
        array.forEach((data: any) => {
          let a = 1, b = 0
          if (data.from.toUpperCase() !== address.toUpperCase()) {
            console.log(address, data.from, 'hey')
            a = 0
            b = 1
          }
          const array = [
            data.blockNumber,
            data.hash,
            Number(data.value) * a,
            Number(data.value) * b,
            Number(data.gasPrice) * Number(data.gasUsed) * a,
            data.from,
            data.to,
          ]
          formedData.push(array)
        })
        console.log(formedData)
      })
  }
  return (
    <ChakraProvider>
      <div className="App">
        <header className="App-header">
          <Box>
            <Text>Address</Text>
            <Input
              size="sm"
              placeholder="Input your wallet address"
              onChange={handleChangeAddress}
            ></Input>
            {/* <Text mt="5">Source Money</Text>
            <InputGroup size="sm">
              <Input placeholder="Input initial balance " />
              <InputRightAddon color="black" children="ETH" />
            </InputGroup> */}
            <Text mt="5">Duration</Text>
            <Flex>
              <Box mr="5">
                <Text> From</Text>
                <Input
                  size="sm"
                  placeholder="start block number"
                  onChange={handleChangeStartBlock}
                />
              </Box>
              <Box>
                <Text>To</Text>
                <Input
                  size="sm"
                  placeholder="end block number"
                  onChange={handleChangeEndBlock}
                />
              </Box>
            </Flex>

            <Button mt="5" color="black" onClick={main}>
              Get Transaction Data in CSV
            </Button>
          </Box>
        </header>
      </div>
    </ChakraProvider>
  )
}

export default App
