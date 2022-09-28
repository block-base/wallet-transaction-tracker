import React, { useState } from 'react'
import axios from 'axios'
import './App.css'
import { Box, Button, Flex, Input, Select, Text } from '@chakra-ui/react'

// 1. import `ChakraProvider` component
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('')
  const [startBlock, setStartBlock] = useState(0)
  const [endBlock, setEndBlock] = useState(99999999)
  const handleChangeAddress = (e: any) => {
    const inputValue = e.target.value
    setAddress(inputValue)
  }
  const handleChangeNetwork = (e: any) => {
    const inputValue = e.target.value
    setNetwork(inputValue)
  }
  const handleChangeStartBlock = (e: any) => {
    const inputValue = e.target.value
    setStartBlock(inputValue)
  }
  const handleChangeEndBlock = (e: any) => {
    const inputValue = e.target.value
    setEndBlock(inputValue)
  }

  const getAPIAndURL = (network: string) => {
    switch (network) {
      case 'ethereum':
        return [
          process.env.ETHERSCAN_API_KEY || 'Z1TKKCFKK9GTVJ3FZP3IA4K8SINX16NCJ3',
          'api.etherscan.io',
        ]
      case 'polygon':
        return [
          process.env.POLYGONSCAN_API_KEY ||
            'GZ6K1PAJV7YH2G2CZNG7RKYSURKXB3PFTA',
          'api.polygonscan.com',
        ]
      case 'optimism':
        return [
          process.env.OPTIMISTIC_ETHERSCAN_API_KEY ||
            '62F9T62NRZXPYIMWSPE4Y6PYE4MKMMGXUZ',
          'api-optimistic.etherscan.io',
        ]
      case 'arbitrum':
        return [
          process.env.ARBISCAN_API_KEY || 'NV6614SZM1P3EB3YKUTRNWWV6V81Y17EA7',
          'api.arbiscan.io',
        ]
      case 'rinkeby':
        return [process.env.RINKEBY_ETHSCAN_API_KEY, 'api.rinkeby.etherscan.io']
      default:
        throw new Error('Method not found.')
    }
  }

  const main = async () => {
    const formedData: any[] = []
    const [API_KEY, URL] = getAPIAndURL(network)
    if (!API_KEY) {
      console.log("Error : API KEY isn't set")
      return
    }

    await axios
      .get(
        `https://${URL}/api?module=account&action=txlistinternal&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=10&sort=asc&apikey=${API_KEY}`,
      )
      .then((res: any) => {
        let array = res.data.result
        console.log(array, 'array')
        array.forEach((data: any) => {
          const array = [
            data.blockNumber,
            data.hash,
            0,
            Number(data.value) / 10 ** 18,
            0,
            data.from,
            data.to,
          ]
          formedData.push(array)
        })
      })
    await axios
      .get(
        `https://${URL}/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}page=1&offset=10&sort=asc&apikey=${API_KEY}`,
      )
      .then((res: any) => {
        let array = res.data.result
        console.log(array, 'array')
        array.forEach((data: any) => {
          let a = 1,
            b = 0
          if (data.from.toUpperCase() !== address.toUpperCase()) {
            console.log(address, data.from, 'hey')
            a = 0
            b = 1
          }
          const array = [
            data.blockNumber,
            data.hash,
            (Number(data.value) * a) / 10 ** 18,
            (Number(data.value) * b) / 10 ** 18,
            (Number(data.gasPrice) * Number(data.gasUsed) * a) / 10 ** 18,
            data.from,
            data.to,
          ]
          formedData.push(array)
        })
      })
    formedData.sort(function (a, b) {
      return a[0] - b[0]
    })
    let sumGot = 0
    let sumSpent = 0;
    let sumGas = 0;
    formedData.forEach((e) => {
      sumSpent += e[2]
      sumGot += e[3]
      sumGas += e[4]
    })
    await axios.get(
      `https://${URL}/api?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`,
    ).then((res: any) => {
      const balance = res.data.result
      formedData.push(['', '', sumSpent, sumGot, sumGas,`Calcurated Balance : ${sumGot - sumSpent - sumGas}`,`Real Balance : ${balance}`])
      formedData.unshift(["Block Numeber", "Hash", "Spent", "Got", "Gas","Address From", "Address To"])
    })

    console.log(formedData)

    // TODO
    // Export this array as CSV format
    let csv = ''
    for (let row of formedData) {
      for (let col of row) {
        csv += col + ','
      }
      csv += '\r\n'
    }

    let myBlob = new Blob([csv], { type: 'text/csv' })

    var url = window.URL.createObjectURL(myBlob)
    var anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'demo.csv'

    anchor.click()
    window.URL.revokeObjectURL(url)
    anchor.remove()
  }
  return (
    <ChakraProvider>
      <div className="App">
        <header className="App-header">
          <Box border={'2px'} p={'64px'}>
            <Text>Wallet Address</Text>
            <Input
              size="sm"
              placeholder="Input your wallet address"
              onChange={handleChangeAddress}
            ></Input>
            <Text mt="5">Network</Text>
            <Select
              size="sm"
              placeholder="Select Network"
              onChange={handleChangeNetwork}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="optimism">Optimism</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="rinkeby">Rinkeby</option>
            </Select>
            {/* <Text mt="5">Source Money</Text>
            <InputGroup size="sm">
              <Input placeholder="Input initial balance " />
              <InputRightAddon color="black" children="ETH" />
            </InputGroup> */}
            <Text mt="5">Duration</Text>
            <Flex>
              <Box mr="5">
                <Text fontSize={'lg'}> From</Text>
                <Input
                  size="sm"
                  placeholder="start block number"
                  onChange={handleChangeStartBlock}
                />
              </Box>
              <Box>
                <Text fontSize={'lg'}>To</Text>
                <Input
                  size="sm"
                  placeholder="end block number"
                  onChange={handleChangeEndBlock}
                />
              </Box>
            </Flex>

            <Button mt="10" color="black" onClick={main}>
              Export Transaction Data in CSV Format
            </Button>
          </Box>
        </header>
      </div>
    </ChakraProvider>
  )
}

export default App
