import { ItemStack } from "./Item";
import { SimulationState } from "./SimulationState";

export interface Command {
	isValid(): boolean,
	execute(state: SimulationState): void,
	getDisplayString(): string,
}

class CommandImpl implements Command{
	isValid(): boolean {
		return true;
	}
	execute(_state: SimulationState): void {
		// nothing
	}
	getDisplayString(): string {
		throw new Error("Method not implemented.");
	}
}

export class CommandInitialize extends CommandImpl {

	private stacks: ItemStack[];
	constructor(stacks: ItemStack[]){
		super();
		this.stacks = stacks;
	}

	public execute(state: SimulationState): void {
		state.initialize(this.stacks);
	}
	public getDisplayString(): string {
		return joinItemStackString("Initialize", this.stacks);
	}

}

export class CommandSave extends CommandImpl {

	public execute(state: SimulationState): void {
		state.save();
	}
	public getDisplayString(): string {
		return "Save";
	}
}

export class CommandSaveAs extends CommandImpl {
	private name: string;
	constructor(name: string){
		super();
		this.name = name;
	}
	public execute(state: SimulationState): void {
		state.save(this.name);
	}
	public getDisplayString(): string {
		return `Save As ${this.name}`;
	}
}

export class CommandReload extends CommandImpl {
	private name?: string;
	constructor(name?: string){
		super();
		this.name = name;
	}
	public execute(state: SimulationState): void {
		state.reload(this.name);
	}
	public getDisplayString(): string {
		return `Reload${this.name?` ${this.name}`:""}`;
	}
}

export class CommandUse extends CommandImpl{
	private name: string;
	constructor(name: string){
		super();
		this.name = name;
	}
	public execute(state: SimulationState): void {
		state.useSaveForNextReload(this.name);
	}
	public getDisplayString(): string {
		return `Use ${this.name}`;
	}
	public isValid(): boolean {
		return false; // this command is deprecated
	}
}

export class CommandBreakSlots extends CommandImpl {

	private numToBreak: number;
	constructor(numToBreak: number){
		super();
		this.numToBreak = numToBreak;
	}

	public execute(state: SimulationState): void {
		state.breakSlots(this.numToBreak);
	}
	public getDisplayString(): string {
		return `Break ${this.numToBreak} Slots`;
	}
}

export class CommandAdd extends CommandImpl {
	private verb: string;
	private count: number;
	private item: string;
	constructor(verb: string, count: number, item: string){
		super();
		this.verb = verb;
		this.count = count;
		this.item = item;
	}

	public execute(state: SimulationState): void {
		state.obtain(this.item, this.count);
	}
	public getDisplayString(): string {
		return `${this.verb} ${this.count} ${this.item}`;
	}
}

export class CommandAddWithoutCount extends CommandImpl {
	private verb: string;
	private item: string;
	constructor(verb: string, item: string){
		super();
		this.verb = verb;
		this.item = item;
	}

	public execute(state: SimulationState): void {
		state.obtain(this.item, 1);
	}
	public getDisplayString(): string {
		return `${this.verb} ${this.item}`;
	}
}

export class CommandAddMultiple extends CommandImpl  {
	private verb: string;
	private stacks: ItemStack[];
	constructor(verb: string, stacks: ItemStack[]){
		super();
		this.verb = verb;
		this.stacks = stacks;
	}

	public execute(state: SimulationState): void {
		this.stacks.forEach(({item, count})=>state.obtain(item,count));
	}
	public getDisplayString(): string {
		return joinItemStackString(this.verb, this.stacks);

	}
}

export class CommandRemove extends CommandImpl  {
	private verb: string;
	private count: number;
	private item: string;
	private slot: number;
	private noSlot: boolean;
	constructor(verb: string, count: number, item: string, slot: number, noSlot: boolean){
		super();
		this.verb = verb;
		this.count = count;
		this.item = item;
		this.slot = slot;
		this.noSlot = noSlot;
	}
	public execute(state: SimulationState): void {
		state.remove(this.item, this.count, this.slot);
	}
	public getDisplayString(): string {
		const slotString = this.noSlot ? "" : ` From Slot ${this.slot+1}`;
		return `${this.verb} ${this.count} ${this.item}${slotString}`;
	}
}

export class CommandRemoveWithoutCount extends CommandImpl  {
	private verb: string;
	private item: string;
	private slot: number;
	private noSlot: boolean;
	constructor(verb: string, item: string, slot: number, noSlot: boolean){
		super();
		this.verb = verb;
		this.item = item;
		this.slot = slot;
		this.noSlot = noSlot;
	}
	public execute(state: SimulationState): void {
		state.remove(this.item, 1, this.slot);
	}
	public getDisplayString(): string {
		const slotString = this.noSlot ? "" : ` From Slot ${this.slot+1}`;
		return `${this.verb} ${this.item}${slotString}`;
	}
}

export class CommandRemoveMultiple extends CommandImpl  {
	private verb: string;
	private stacks: ItemStack[];
	constructor(verb: string, stacks: ItemStack[]){
		super();
		this.verb = verb;
		this.stacks = stacks;
	}

	public execute(state: SimulationState): void {
		this.stacks.forEach(({item, count})=>state.remove(item,count,0));
	}
	public getDisplayString(): string {
		return joinItemStackString(this.verb, this.stacks);
	}
}

const joinItemStackString = (initial: string, stacks: ItemStack[]): string => {
	const parts: string[] = [initial];
	stacks.forEach(({item, count})=>{
		parts.push(""+count);
		parts.push(item);
	});
	return parts.join(" ");
};

export class CommandDaP extends CommandImpl  {
	private stacks: ItemStack[];

	constructor(stacks: ItemStack[]){
		super();
		this.stacks = stacks;
	}
	public execute(state: SimulationState): void {
		this.stacks.forEach(({item,count})=>{
			state.remove(item, count, 0);
			state.obtain(item, count);
		});
		
	}
	public getDisplayString(): string {
		return joinItemStackString("D&P", this.stacks);
	}
}

export class CommandEquip extends CommandImpl  {
	private item: string;
	private slot: number;
	private noSlot: boolean;
	constructor(item: string, slot: number, noSlot: boolean){
		super();
		this.item = item;
		this.slot = slot;
		this.noSlot = noSlot;
	}
	
	public execute(state: SimulationState): void {
		state.equip(this.item, this.slot);
	}
	public getDisplayString(): string {
		const slotString = this.noSlot ? "" : ` In Slot ${this.slot+1}`;
		return `Equip ${this.item}${slotString}`;
	}
}

export class CommandUnequip extends CommandImpl {
	private item: string;
	private slot: number;
	private noSlot: boolean;
	constructor(item: string, slot: number, noSlot: boolean){
		super();
		this.item = item;
		this.slot = slot;
		this.noSlot = noSlot;
	}
	
	public execute(state: SimulationState): void {
		state.unequip(this.item, this.slot);
	}
	public getDisplayString(): string {
		const slotString = this.noSlot ? "" : ` In Slot ${this.slot+1}`;
		return `Unequip ${this.item}${slotString}`;
	}
}

export class CommandShootArrow extends CommandImpl  {
	private count: number;
	constructor(count: number){
		super();
		this.count = count;
	}
	
	public execute(state: SimulationState): void {
		state.shootArrow(this.count);
	}
	public getDisplayString(): string {
		return `Shoot ${this.count} Arrow`;
	}
}

export class CommandCloseGame extends CommandImpl  {
	public execute(state: SimulationState): void {
		state.closeGame();
	}
	public getDisplayString(): string {
		return "Close Game";
	}
}

export class CommandSync extends CommandImpl  {
	private actionString: string;
	constructor(actionString: string){
		super();
		this.actionString = actionString;
	}

	public execute(state: SimulationState): void {
		state.syncGameDataWithPouch();
	}
	public getDisplayString(): string {
		return this.actionString;
	}
}

export class CommandEventide extends CommandImpl  {
	private enter: boolean;
	constructor(enter: boolean){
		super();
		this.enter = enter;
	}

	public execute(state: SimulationState): void {
		state.setEventide(this.enter);
	}
	public getDisplayString(): string {
		return `${this.enter? "Enter":"Exit"} Eventide`;
	}
}

export class CommandNop extends CommandImpl  {
	private text: string;
	constructor(text: string){
		super();
		this.text = text;
	}
	public isValid(): boolean {
		return false;
	}
	public execute(_state: SimulationState): void {
		// nothing
	}
	public getDisplayString(): string {
		return this.text;
	}
}

export class CommandSortKey extends CommandImpl  {
	static Op = 0x5;
	// public fromBuffer(_buf: Buffer): number {
	// 	return 0;
	// }
	// public toBuffer(): Buffer {
	// 	const buf: Buffer = Buffer.alloc(1);
	// 	buf.writeInt8(CommandSortKey.Op);
	// 	return buf;
	// }
	public execute(_state: SimulationState): void {
		// wip
	}
	public getDisplayString(): string {
		return "Sort Key";
	}
}

export class CommandSortMaterial extends CommandImpl  {
	static Op = 0x6;
	// public fromBuffer(_buf: Buffer): number {
	// 	return 0;
	// }
	// public toBuffer(): Buffer {
	// 	const buf: Buffer = Buffer.alloc(1);
	// 	buf.writeInt8(CommandSortMaterial.Op);
	// 	return buf;
	// }
	public execute(_state: SimulationState): void {
		// wip
	}
	public getDisplayString(): string {
		return "Sort Material";
	}
}
