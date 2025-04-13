import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';
import { WORKFLOWS_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BuildingsService {
  constructor(
    @Inject(WORKFLOWS_SERVICE) private readonly client: ClientProxy,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(createBuildingDto: CreateBuildingDto) {
    const building = this.buildingRepository.create({ name: 'amr' });
    const newBuildingEntity = await this.buildingRepository.save(building);

    const res = await this.createWorkflow(1);
    return newBuildingEntity;
  }

  async findAll() {
    return await this.buildingRepository.find();
  }

  async findOne(id: number) {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building #${id} does not exists`);
    }
    return building;
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto) {
    const building = await this.buildingRepository.preload({
      id,
      ...updateBuildingDto,
    });

    if (!building) {
      throw new NotFoundException(`Building #${id} does not exists`);
    }
    return await this.buildingRepository.save(building);
  }

  async remove(id: number) {
    const building = await this.findOne(id);
    return this.buildingRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    const newWorkFlow = await lastValueFrom(
      this.client.send('workflows.create', {
        name: 'My Second Work Flows',
        buildingId,
      } as CreateWorkflowDto),
    );
    console.log({ newWorkFlow });
    return newWorkFlow;
  }
}
