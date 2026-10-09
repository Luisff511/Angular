import { Component, HostListener, computed, signal } from '@angular/core';

type Operador = '+' | '-' | '×' | '÷';

@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  // Lo que se ve en grande en la pantalla
  pantalla = signal('0');
  // Valor guardado y operador pendiente (ej: 12 + ...)
  anterior = signal<number | null>(null);
  operador = signal<Operador | null>(null);
  // Si es true, el siguiente número que se pulse empieza de cero
  nuevoNumero = signal(true);

  operacion = computed(() => {
    const op = this.operador();
    const valor = this.anterior();
    return op && valor !== null ? `${this.formatear(valor)} ${op}` : '';
  });

  teclas = [
    { texto: 'AC', tipo: 'funcion' },
    { texto: '±', tipo: 'funcion' },
    { texto: '%', tipo: 'funcion' },
    { texto: '÷', tipo: 'operador' },
    { texto: '7', tipo: 'numero' },
    { texto: '8', tipo: 'numero' },
    { texto: '9', tipo: 'numero' },
    { texto: '×', tipo: 'operador' },
    { texto: '4', tipo: 'numero' },
    { texto: '5', tipo: 'numero' },
    { texto: '6', tipo: 'numero' },
    { texto: '-', tipo: 'operador' },
    { texto: '1', tipo: 'numero' },
    { texto: '2', tipo: 'numero' },
    { texto: '3', tipo: 'numero' },
    { texto: '+', tipo: 'operador' },
    { texto: '0', tipo: 'numero cero' },
    { texto: ',', tipo: 'numero' },
    { texto: '=', tipo: 'igual' },
  ];

  pulsar(tecla: string) {
    if (/^[0-9]$/.test(tecla)) this.escribirNumero(tecla);
    else if (tecla === ',') this.escribirComa();
    else if (tecla === 'AC') this.borrarTodo();
    else if (tecla === '±') this.cambiarSigno();
    else if (tecla === '%') this.porcentaje();
    else if (tecla === '=') this.calcularResultado();
    else this.elegirOperador(tecla as Operador);
  }

  escribirNumero(numero: string) {
    if (this.nuevoNumero() || this.pantalla() === '0') {
      this.pantalla.set(numero);
      this.nuevoNumero.set(false);
    } else if (this.pantalla().replace(/[-,]/g, '').length < 12) {
      this.pantalla.update((valor) => valor + numero);
    }
  }

  escribirComa() {
    if (this.nuevoNumero()) {
      this.pantalla.set('0,');
      this.nuevoNumero.set(false);
    } else if (!this.pantalla().includes(',')) {
      this.pantalla.update((valor) => valor + ',');
    }
  }

  borrarUltimo() {
    if (this.nuevoNumero()) return;
    const valor = this.pantalla().slice(0, -1);
    this.pantalla.set(valor === '' || valor === '-' ? '0' : valor);
  }

  borrarTodo() {
    this.pantalla.set('0');
    this.anterior.set(null);
    this.operador.set(null);
    this.nuevoNumero.set(true);
  }

  cambiarSigno() {
    if (this.pantalla() === '0' || this.pantalla() === 'Error') return;
    this.pantalla.update((valor) => (valor.startsWith('-') ? valor.slice(1) : '-' + valor));
  }

  porcentaje() {
    this.mostrar(this.leerPantalla() / 100);
  }

  elegirOperador(op: Operador) {
    // Si ya había una operación a medias, se resuelve primero (12 + 3 + ... = 15 + ...)
    if (this.operador() && !this.nuevoNumero()) {
      this.calcularResultado();
    }
    if (this.pantalla() === 'Error') return;
    this.anterior.set(this.leerPantalla());
    this.operador.set(op);
    this.nuevoNumero.set(true);
  }

  calcularResultado() {
    const op = this.operador();
    const a = this.anterior();
    if (!op || a === null) return;

    const b = this.leerPantalla();
    let resultado = 0;
    switch (op) {
      case '+':
        resultado = a + b;
        break;
      case '-':
        resultado = a - b;
        break;
      case '×':
        resultado = a * b;
        break;
      case '÷':
        resultado = b === 0 ? NaN : a / b;
        break;
    }

    this.anterior.set(null);
    this.operador.set(null);
    this.mostrar(resultado);
  }

  // Atajos de teclado: números, operadores, Enter, Backspace y Escape
  @HostListener('window:keydown', ['$event'])
  teclado(evento: KeyboardEvent) {
    const equivalencias: Record<string, string> = {
      '*': '×',
      x: '×',
      '/': '÷',
      '.': ',',
      Enter: '=',
      Escape: 'AC',
    };
    const tecla = equivalencias[evento.key] ?? evento.key;

    if (tecla === 'Backspace') {
      this.borrarUltimo();
    } else if (/^[0-9+\-×÷,=%]$/.test(tecla) || tecla === 'AC') {
      evento.preventDefault();
      this.pulsar(tecla);
    }
  }

  private leerPantalla(): number {
    return Number(this.pantalla().replace(',', '.')) || 0;
  }

  private mostrar(valor: number) {
    this.pantalla.set(Number.isFinite(valor) ? this.formatear(valor) : 'Error');
    this.nuevoNumero.set(true);
  }

  // Quita los errores de decimales (0,1 + 0,2 = 0,3) y usa coma decimal
  private formatear(valor: number): string {
    const redondeado = Number.parseFloat(valor.toPrecision(12));
    if (Math.abs(redondeado) >= 1e12) return redondeado.toExponential(4).replace('.', ',');
    return String(redondeado).replace('.', ',');
  }
}
