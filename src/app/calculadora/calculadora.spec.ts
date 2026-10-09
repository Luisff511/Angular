import { TestBed } from '@angular/core/testing';
import { Calculadora } from './calculadora';

describe('Calculadora', () => {
  let calc: Calculadora;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Calculadora] });
    calc = TestBed.createComponent(Calculadora).componentInstance;
  });

  const pulsar = (...teclas: string[]) => teclas.forEach((t) => calc.pulsar(t));

  it('suma dos números', () => {
    pulsar('1', '2', '+', '3', '=');
    expect(calc.pantalla()).toBe('15');
  });

  it('encadena operaciones', () => {
    pulsar('2', '+', '3', '×', '4', '=');
    expect(calc.pantalla()).toBe('20');
  });

  it('corrige los decimales', () => {
    pulsar('0', ',', '1', '+', '0', ',', '2', '=');
    expect(calc.pantalla()).toBe('0,3');
  });

  it('muestra error al dividir entre cero', () => {
    pulsar('5', '÷', '0', '=');
    expect(calc.pantalla()).toBe('Error');
  });

  it('calcula porcentajes y cambia el signo', () => {
    pulsar('5', '0', '%');
    expect(calc.pantalla()).toBe('0,5');
    pulsar('AC', '7', '±');
    expect(calc.pantalla()).toBe('-7');
  });
});
