import { expect } from 'chai';
import { ethers } from 'ethers';
import { admin, other } from '../helper/test.helper';
import { ethers as hre } from 'hardhat';

import Proxy from '../abis/Proxy.json';
import V2 from '../abis/V2.json';

describe('Proxy Upgrade', function () {
  const proxyByOther = new ethers.Contract(Proxy.address, Proxy.abi, other);
  const proxyAsV2 = new ethers.Contract(V2.address, V2.abi, admin);

  it('Admin만이 업그레이드를 실행할 수 있습니다.', async () => {
    try {
      const V2 = await hre.getContractFactory('V2');
      const v2 = await V2.deploy();
      await v2.waitForDeployment();

      const upgrade = await proxyByOther.upgrade(v2.target);
      await upgrade.wait();
    } catch (error: any) {
      expect(error.message).to.include('Caller is not the admin');
    }
  });

  it('V2로 upgrade를 실행 후 V2의 로직이 실행되어야 합니다.', async function () {
    const prevValue = await proxyAsV2.value();

    const setValue = await proxyAsV2.setValue(5);
    await setValue.wait();

    const newValue = await proxyAsV2.value();
    expect(Number(newValue)).to.equal(Number(prevValue) + 5);
  });
});
