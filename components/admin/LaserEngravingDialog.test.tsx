import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  createLaserEngravingAction,
  updateLaserEngravingAction,
} from '@/lib/actions/laser-engraving-mutations.action';
import type { LaserEngravingFormItem } from '@/lib/constants/laser-engraving';
import { LaserEngravingDialog } from './LaserEngravingDialog';

vi.mock('@/lib/actions/laser-engraving-mutations.action', () => ({
  createLaserEngravingAction: vi.fn(),
  updateLaserEngravingAction: vi.fn(),
}));

vi.mock('@/components/admin/SellableItemDialog', () => ({
  SellableItemDialog: ({
    item,
    open,
    config,
  }: {
    item: LaserEngravingFormItem | null;
    open: boolean;
    config: {
      createTitle: string;
      editTitle: string;
      description: string;
      imageAlt: string;
      showSlug: boolean;
      showDiscountField: () => boolean;
      validateDiscount: (value: number) => true | string;
      submitItem: (
        id: number | undefined,
        values: {
          slug?: string;
          name: string;
          description: string;
          price: number;
          discount: number;
          quantity: number;
          images: string[];
          files?: File[];
        },
      ) => Promise<unknown>;
    };
  }) => (
    <div>
      <p>{open ? 'open' : 'closed'}</p>
      <p>{item ? config.editTitle : config.createTitle}</p>
      <p>{config.description}</p>
      <p>{config.imageAlt}</p>
      <p>slug:{String(config.showSlug)}</p>
      <p>discount:{String(config.showDiscountField())}</p>
      <p>valid:{String(config.validateDiscount(15))}</p>
      <p>decimal:{config.validateDiscount(1.5)}</p>
      <p>below:{config.validateDiscount(-1)}</p>
      <p>above:{config.validateDiscount(100)}</p>
      <button
        type="button"
        onClick={() =>
          void config.submitItem(undefined, {
            slug: undefined,
            name: 'Placa corazon',
            description: 'Grabado laser',
            price: 180,
            discount: 0,
            quantity: 4,
            images: ['placa.jpg'],
          })
        }
      >
        Crear
      </button>
      <button
        type="button"
        onClick={() =>
          void config.submitItem(7, {
            slug: 'placa-corazon',
            name: 'Placa corazon',
            description: 'Grabado laser',
            price: 180,
            discount: 0,
            quantity: 4,
            images: ['placa.jpg'],
            files: [],
          })
        }
      >
        Actualizar
      </button>
    </div>
  ),
}));

const laserEngraving: LaserEngravingFormItem = {
  id: 7,
  slug: 'placa-corazon',
  name: 'Placa corazon',
  description: 'Grabado laser',
  price: 180,
  discount: 0,
  priceWithDiscount: 180,
  quantity: 4,
  images: ['placa.jpg'],
};

describe('LaserEngravingDialog', () => {
  it('configures the reusable dialog for creating and validating laser engravings', async () => {
    render(
      <LaserEngravingDialog
        laserEngraving={null}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Agregar nuevo grabado')).toBeVisible();
    expect(
      screen.getByText('Ingrese todos los detalles del grabado láser'),
    ).toBeVisible();
    expect(screen.getByText('Grabado laser')).toBeVisible();
    expect(screen.getByText('slug:true')).toBeVisible();
    expect(screen.getByText('discount:true')).toBeVisible();
    expect(screen.getByText('valid:true')).toBeVisible();
    expect(
      screen.getByText('decimal:El descuento debe ser un número entero'),
    ).toBeVisible();
    expect(
      screen.getByText('below:El descuento debe estar entre 0 y 99'),
    ).toBeVisible();
    expect(
      screen.getByText('above:El descuento debe estar entre 0 y 99'),
    ).toBeVisible();

    screen.getByRole('button', { name: 'Crear' }).click();

    expect(createLaserEngravingAction).toHaveBeenCalledWith({
      slug: '',
      name: 'Placa corazon',
      description: 'Grabado laser',
      price: 180,
      discount: 0,
      quantity: 4,
      images: ['placa.jpg'],
      files: undefined,
    });
  });

  it('configures the reusable dialog for updating laser engravings', () => {
    render(
      <LaserEngravingDialog
        laserEngraving={laserEngraving}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Editar grabado')).toBeVisible();

    screen.getByRole('button', { name: 'Actualizar' }).click();

    expect(updateLaserEngravingAction).toHaveBeenCalledWith(7, {
      slug: 'placa-corazon',
      name: 'Placa corazon',
      description: 'Grabado laser',
      price: 180,
      discount: 0,
      quantity: 4,
      images: ['placa.jpg'],
      files: [],
    });
  });
});
