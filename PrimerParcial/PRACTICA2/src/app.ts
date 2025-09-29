import { ClienteService } from "./service/ClienteServ";

const clienteService = new ClienteService();

clienteService.crear({
    id_cliente: 1,
    nombre: "Juan", 
    correo: "asdfgh@dfg.com",
    telefono: "123456789", 
    
});
console.log (clienteService.mostrar());
clienteService.eliminar(1);
clienteService.crear({
    id_cliente: 2,
    nombre: "Pedro", 
    correo: "abcd@123.co",
    telefono: "987654321", 
    
});
console.log (clienteService.mostrar());
clienteService.modificar({
    id_cliente: 2,
    nombre: "Pablo", 
    correo: "abcd@123.com",
    telefono: "987654321", 
});
console.log (clienteService.mostrar());