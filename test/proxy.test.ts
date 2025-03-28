import { expect } from 'chai';
import { ethers } from 'hardhat';

import Proxy from '../abis/Proxy.json';
import V1 from '../abis/V1.json';

import { admin, other } from '../helper/test.helper';

describe('V1 via Proxy', function () {
  const proxyByAdmin = new ethers.Contract(Proxy.address, Proxy.abi, admin);
  const proxyByOther = new ethers.Contract(Proxy.address, Proxy.abi, other);
  const proxyAsV1 = new ethers.Contract(V1.address, V1.abi, admin);

  it('Proxy 컨트랙트는 V1 컨트랙트의 함수를 실행하고, 자신의 Storage에 저장해야 합니다.', async () => {
    const tx = await proxyAsV1.setValue(42);
    await tx.wait();

    const value = await proxyAsV1.value();
    expect(value).to.equal(42);
  });

  it('Admin 계정만이 Admin 변경이 가능해야 합니다.', async () => {
    const prevAdmin = await proxyByAdmin.getAdmin();

    const adminTransfer = await proxyByAdmin.adminTransfer(other.address);
    await adminTransfer.wait();

    const newAdmin = await proxyByAdmin.getAdmin();

    expect(await proxyByAdmin.getAdmin()).to.equal(other.address);

    if (newAdmin.toLowerCase() === other.address.toLowerCase()) {
      const resetting = await proxyByOther.adminTransfer(prevAdmin);
      await resetting.wait();
    }
  });
});
