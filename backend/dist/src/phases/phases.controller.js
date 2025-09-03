"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhasesController = void 0;
const common_1 = require("@nestjs/common");
const phases_service_1 = require("./phases.service");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePhaseDto {
    name;
    plannedAmount;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhaseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePhaseDto.prototype, "plannedAmount", void 0);
let PhasesController = class PhasesController {
    phases;
    constructor(phases) {
        this.phases = phases;
    }
    async create(projectId, dto) {
        return this.phases.create(projectId, dto);
    }
    async list(projectId) {
        return this.phases.list(projectId);
    }
};
exports.PhasesController = PhasesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreatePhaseDto]),
    __metadata("design:returntype", Promise)
], PhasesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PhasesController.prototype, "list", null);
exports.PhasesController = PhasesController = __decorate([
    (0, swagger_1.ApiTags)('phases'),
    (0, common_1.Controller)('projects/:projectId/phases'),
    __metadata("design:paramtypes", [phases_service_1.PhasesService])
], PhasesController);
//# sourceMappingURL=phases.controller.js.map