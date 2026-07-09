import { laserEngravingsApi } from '../api/laser-engravings.api';
import type {
  ILaserEngraving,
  LaserEngravingResponse,
} from '../interfaces/laser-engraving';
import type { Paging } from '../interfaces/product';

interface GetLaserEngravingsParams {
  query?: string;
  page?: number;
  limit?: number;
}

export const getLaserEngravingsByQuery = async (
  params: GetLaserEngravingsParams,
): Promise<{ data: ILaserEngraving[]; paging: Paging }> => {
  const response = await laserEngravingsApi<LaserEngravingResponse>('/', {
    params,
  });

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
